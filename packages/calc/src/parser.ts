import FastFormulaParser from "fast-formula-parser";
import { DepParser } from "fast-formula-parser/grammar/dependency/hooks";
import FormulaError from "fast-formula-parser/formulas/error";
import { detectDataType, DATATYPES, castToString, isNull } from "./helpers";
import { CellsBySheet } from "./calc";
import merge from "lodash.merge";
import { CellConfig, CellConfigGetter } from "./types";

export type Sheet = string;

export interface CellPosition {
  sheet: Sheet;
  row: number;
  col: number;
}

export interface CellRange {
  sheet: Sheet;
  from: Omit<CellPosition, "sheet">;
  to: Omit<CellPosition, "sheet">;
}

export type ResultArray = any[][];

export const DEFAULT_HYPERLINK_COLOR = "#1155CC";

// Should match SpreadSheet CellConfig
export interface ParseResults {
  result?: React.ReactText | undefined | ResultArray;
  resultType?: DATATYPES;
  error?: string;
  hyperlink?: string;
  errorMessage?: string;
  color?: string;
  underline?: boolean;
}

const basePosition: CellPosition = { row: 1, col: 1, sheet: "Sheet1" };

export interface CellInterface {
  rowIndex: number;
  columnIndex: number;
}

export type GetValue = (sheet: Sheet, cell: CellInterface) => CellConfig;

export type Functions = Record<string, (...args: any[]) => any>;

export interface FormulaProps {
  getValue?: CellConfigGetter | undefined;
  functions?: Functions;
  rowCount: number;
  columnCount: number;
  getMinMaxRows: (id: Sheet) => number[];
  getMinMaxColumns: (id: Sheet, rowIndex: number) => number[];
}

function extractIfJSON(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

const defaultMinMaxRows = () => [0, 100];
/**
 * Create a formula parser
 * @param param0
 */
class FormulaParser {
  formulaParser: FastFormulaParser;
  dependencyParser: DepParser;
  getValue: CellConfigGetter | undefined;
  currentValues: CellsBySheet | undefined;
  columnCount!: number;
  rowCount!: number;
  minMaxRowGetter!: (id: string) => number[];
  minMaxColumnGetter!: (id: string, rowIndex: number) => number[];
  constructor(options: FormulaProps) {
    if (options.getValue) {
      this.getValue = options.getValue;
    }
    if (options.rowCount) {
      this.rowCount = options.rowCount;
    }
    if (options.columnCount) {
      this.columnCount = options.columnCount;
    }
    if (options.getMinMaxRows) {
      this.minMaxRowGetter = options.getMinMaxRows;
    }
    if (options.getMinMaxColumns) {
      this.minMaxColumnGetter = options.getMinMaxColumns;
    }
    this.formulaParser = new FastFormulaParser({
      functions: options?.functions,
      onCell: this.getCellValue,
      onRange: this.getRangeValue,
    });
    this.dependencyParser = new DepParser();
  }

  getMinMaxRows(id: Sheet) {
    return this.minMaxRowGetter(id);
  }

  getMinMaxColumns(id: Sheet, rowIndex: number) {
    return this.minMaxColumnGetter(id, rowIndex);
  }

  updateRowColumnCount(rowCount: number, columnCount: number) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
  }

  cacheValues = (changes: CellsBySheet) => {
    this.currentValues = merge(this.currentValues, changes);
  };

  clearCachedValues = () => {
    this.currentValues = undefined;
  };

  getCellConfig = (position: CellPosition) => {
    const sheet = position.sheet;
    const cell = {
      rowIndex: Math.min(position.row, this.rowCount),
      columnIndex: Math.min(position.col, this.columnCount),
    };
    const config =
      this.currentValues?.[position.sheet]?.[position.row]?.[position.col] ??
      this.getValue?.(sheet, cell) ??
      null;
    if (config === null) return config;
    if (config?.datatype === "formula" || !isNull(config?.resultType)) {
      return config?.resultType === "number"
        ? Number(castToString(config?.result) ?? "0")
        : config?.result;
    }
    return config && config.datatype === "number"
      ? Number(castToString(config.text) ?? "0")
      : config.text ?? null;
  };

  getCellValue = (pos: CellPosition) => {
    return this.getCellConfig(pos);
  };

  getRangeValue = (ref: CellRange) => {
    const arr = [];
    const [minRows, maxRows] = this.getMinMaxRows(ref.sheet);
    const rowFrom = Math.max(ref.from.row, minRows);
    const rowTo = Math.min(ref.to.row, maxRows);

    for (let row = rowFrom; row <= rowTo; row++) {
      const innerArr = [];
      const [minCols, maxCols] = this.getMinMaxColumns(ref.sheet, row);
      const colFrom = Math.max(ref.from.col, minCols);
      const colTo = Math.min(ref.to.col, maxCols);
      for (let col = colFrom; col <= colTo; col++) {
        innerArr.push(this.getCellValue({ sheet: ref.sheet, row, col }));
      }
      arr.push(innerArr);
    }
    return arr;
  };
  parse = async (
    text: string | null,
    position: CellPosition = basePosition,
    getValue?: CellConfigGetter
  ): Promise<ParseResults> => {
    /* Update getter */
    if (getValue !== void 0) this.getValue = getValue;
    let result;
    let error;
    let errorMessage;
    let hyperlink;
    let underline;
    let color;
    let resultType: DATATYPES | undefined;
    try {
      result = await this.formulaParser
        .parseAsync(text, position, true)
        .catch((err: FormulaError) => {
          error = err.error || err.message;
          errorMessage = err.message;
        });

      /* Check if its JSON */
      result = extractIfJSON(result);

      /**
       * Parse special types
       * 1. Hyperlink
       */
      if (!Array.isArray(result) && typeof result === "object") {
        // Hyperlink
        if (result?.datatype === "hyperlink") {
          resultType = result.datatype;
          hyperlink = result.hyperlink;
          result = result.title || result.hyperlink;
          color = DEFAULT_HYPERLINK_COLOR;
          underline = true;
        }
      } else {
        resultType = detectDataType(result);
      }

      if ((result as any) instanceof FormulaError) {
        error = ((result as unknown) as FormulaError).error;
        errorMessage = ((result as unknown) as FormulaError).message;
      }
    } catch (err) {
      error = err.toString();
      resultType = "error";
    }
    return {
      result,
      resultType,
      hyperlink,
      color,
      underline,
      error,
      errorMessage,
    };
  };
  getDependencies = (
    text: string,
    position: CellPosition = basePosition
  ): CellRange[] | CellPosition[] => {
    return this.dependencyParser.parse(text, position);
  };
}

export { FormulaParser };
