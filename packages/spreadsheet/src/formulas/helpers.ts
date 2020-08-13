import {
  lex,
  tokenVocabulary,
  Token,
} from "fast-formula-parser/grammar/lexing";
import { addressToCell, cellToAddress } from "./../constants";
import { CellInterface, SelectionArea } from "@rowsncolumns/grid";
import { FormulaSelection } from "../Grid/Grid";
import { SheetID } from "../Spreadsheet";

export const TOKEN_TYPE_CELL = "Cell";
export const getSelectionColorAtIndex = (key: number) => {
  var hash = 0;
  var colors = [
    "#11a9cc",
    "#a61d4c",
    "#4285f4",
    "#f4b400",
    "#65b045",
    "#e51c23",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#5677fc",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#259b24",
    "#8bc34a",
    "#afb42b",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#607d8b",
    "#880e4f",
    "#827717",
    "#f7981d", // orange
    "#7e3794",
  ];
  var str = key.toString();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  hash = ((hash % colors.length) + colors.length) % colors.length;
  return colors[hash];
};

export const selectionFromCells = (
  start: CellInterface,
  end: CellInterface | null = start,
  sheetName: SheetID | undefined
): FormulaSelection => {
  if (!end) end = start;
  return {
    bounds: {
      top: Math.min(start.rowIndex, end.rowIndex),
      left: start.columnIndex,
      right: end.columnIndex,
      bottom: Math.max(start.rowIndex, end.rowIndex),
    },
    sheet: sheetName,
  };
};

export const selectionToAddress = (
  sel: SelectionArea | undefined
): string | null => {
  if (!sel) return null;
  const { top, left, right, bottom } = sel.bounds;
  const from = cellToAddress({ rowIndex: top, columnIndex: left });
  const to = cellToAddress({ rowIndex: bottom, columnIndex: right });
  return from === to ? from : `${from}:${to || ""}`;
};

export const getSelectionsFromInput = (
  text: string,
  sheet: SheetID | undefined
) => {
  const selections = [];
  try {
    const { tokens } = lex(text);
    let len = tokens.length;
    let i = 0;
    let activeSheet = null;
    while (i < len) {
      const token = tokens[i];
      const { image, tokenType } = token;
      if (
        tokenType.name === tokenVocabulary.Sheet.name ||
        tokenType.name === tokenVocabulary.SheetQuoted.name
      ) {
        activeSheet = token;
        i++;
        continue;
      }
      if (tokenType.name === tokenVocabulary.Cell.name) {
        let startCell = addressToCell(image);
        if (!startCell) {
          i++;
          continue;
        }
        let endCell;
        // Check if its a range
        const isRange =
          tokens[i + 1]?.tokenType.name === tokenVocabulary.Colon.name;
        if (isRange) {
          const toImage = tokens[i + 2]?.image;
          endCell = addressToCell(toImage);
        }
        const sheetName = activeSheet?.image.slice(0, -1) || sheet;
        const sel = selectionFromCells(startCell, endCell, sheetName);
        selections.push(sel);
        if (isRange) {
          i = i + 3;
          continue;
        }

        activeSheet = null;
      }
      i++;
    }
    return selections;
  } catch (err) {
    return selections;
  }
};

export const normalizeTokens = (text: string | undefined): Token[] => {
  const normalizedTokens: Token[] = [];
  if (text === void 0) return normalizedTokens;
  try {
    const { tokens } = lex(text);
    let len = tokens.length;
    let i = 0;
    let selIndex = -1;
    let activeSheet: Token | null = null;
    while (i < len) {
      const token = tokens[i];
      const { image, tokenType } = token;
      let toImage;
      if (
        tokenType.name === tokenVocabulary.Sheet.name ||
        tokenType.name === tokenVocabulary.SheetQuoted.name
      ) {
        activeSheet = token;
        i++;
        continue;
      }
      if (tokenType.name === tokenVocabulary.Cell.name) {
        let startCell = addressToCell(image);
        if (!startCell) {
          i++;
          continue;
        }
        let endCell;
        // Check if its a range
        const isRange =
          tokens[i + 1]?.tokenType.name === tokenVocabulary.Colon.name;
        if (isRange) {
          toImage = tokens[i + 2]?.image;
          endCell = addressToCell(toImage);
        }
        const sheetName = activeSheet?.image;
        const sel = selectionFromCells(startCell, endCell, sheetName);
        normalizedTokens.push({
          ...token,
          image:
            (activeSheet ? activeSheet.image : "") +
            (isRange ? `${image}:${toImage || ""}` : image),
          endColumn: isRange
            ? token.endColumn + `:${toImage || ""}`.length
            : token.endColumn,
          endOffset: isRange
            ? token.endOffset + `:${toImage || ""}`.length
            : token.endOffset,
          startOffset: activeSheet
            ? activeSheet.startOffset
            : token.startOffset,
          index: ++selIndex,
          sheetName,
          range: isRange,
          sel: sel,
        });

        if (isRange) {
          i = i + 3;
          continue;
        }

        activeSheet = null;
      } else {
        normalizedTokens.push(token);
      }
      i++;
    }

    return normalizedTokens;
  } catch (err) {
    return normalizedTokens;
  }
};

export { tokenVocabulary };
