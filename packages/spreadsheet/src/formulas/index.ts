import FormulaError from "fast-formula-parser/formulas/error";
import { FormulaParser } from "@rowsncolumns/calc";

export interface FunctionArgument {
  value: string | number;
  isArray: boolean;
  isRangeRef: boolean;
  isCellRef: boolean;
}
export function importData(
  parser: FormulaParser,
  arg: FunctionArgument | undefined
) {
  if (!arg || !arg.value)
    throw new FormulaError("#N/A", "Wrong number of arguments provided.");
  const { value } = arg;
  return fetch(value.toString())
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response;
    })
    .then((response) => response.text())
    .then((response) => {
      const separator = value.toString().endsWith("tsv") ? "\t" : ",";
      const data = [];
      const rows = response.split("\n");
      for (const row of rows) {
        const cols = row.split(separator);
        data.push(cols);
      }
      return data;
    })
    .catch((err) => {
      throw new FormulaError("#NA", err.toString());
    });
}

export function min(parser: FormulaParser, ...arg: FunctionArgument[]) {
  return Math.min(...arg.map((item) => Number(item.value)));
}
export function max(parser: FormulaParser, ...arg: FunctionArgument[]) {
  return Math.max(...arg.map((item) => Number(item.value)));
}

export function hyperLink(
  parser: FormulaParser,
  urlArg: FunctionArgument,
  titleArg: FunctionArgument
) {
  if ((titleArg?.value as any) instanceof FormulaError) {
    throw new FormulaError("#VALUE", "Invalid title");
  }
  if ((urlArg?.value as any) instanceof FormulaError) {
    throw new FormulaError("#VALUE", "Invalid url");
  }
  return JSON.stringify({
    title: titleArg?.value,
    hyperlink: urlArg?.value,
    datatype: "hyperlink",
  });
}

/* Default export */
export const formulas = {
  IMPORTDATA: importData,
  MIN: min,
  MAX: max,
  HYPERLINK: hyperLink,
};

export { FormulaError };
