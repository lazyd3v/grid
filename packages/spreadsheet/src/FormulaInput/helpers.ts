import { lex, tokenVocabulary } from "fast-formula-parser/grammar/lexing";
import { addressToCell } from "./../constants";
import { CellInterface, SelectionArea } from "@rowsncolumns/grid";

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
    "#7e3794"
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
  end: CellInterface | null = start
): SelectionArea => {
  if (!end) end = start;
  return {
    bounds: {
      top: Math.min(start.rowIndex, end.rowIndex),
      left: start.columnIndex,
      right: end.columnIndex,
      bottom: Math.max(start.rowIndex, end.rowIndex)
    }
  };
};

export const getSelectionsFromInput = (text: string) => {
  const selections = [];
  try {
    const { tokens } = lex(text);
    let len = tokens.length;
    let i = 0;
    while (i < len) {
      const { image, tokenType } = tokens[i];
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
        const sel = selectionFromCells(startCell, endCell);
        selections.push(sel);
        if (isRange) {
          i = i + 3;
          continue;
        }
      }
      i++;
    }
    return selections;
  } catch (err) {
    return selections;
  }
};
