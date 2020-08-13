import FastFormulaParser from "fast-formula-parser";
import { FormulaParser, CellInterface, Sheet } from "./../src/parser";
import { CellConfig } from "../src/types";

describe("parser", () => {
  let formulaParser: FormulaParser;
  let baseParser: FastFormulaParser;
  let position = { sheet: "Sheet1", row: 1, col: 1 };
  let getMinMaxRows = () => [0, 100];
  let getMinMaxColumns = () => [0, 100];
  let getValue = (sheet: Sheet, cell: CellInterface): CellConfig => {
    return {
      text: "12",
      datatype: "number",
    };
  };
  beforeEach(() => {
    formulaParser = new FormulaParser({
      getValue,
      rowCount: 100,
      columnCount: 100,
      getMinMaxRows,
      getMinMaxColumns,
    });
    // baseParser = new FastFormulaParser({
    //   onCell: ref => null
    // })
  });

  it("exists", () => {
    expect(formulaParser).toBeDefined();
    expect(formulaParser.getValue).toBeDefined();
    expect(formulaParser.parse).toBeDefined();
    expect(formulaParser.getDependencies).toBeDefined();
  });

  it("can parse formulas and ranges", async () => {
    // expect((await baseParser.parse("A1", position, true))).toBe(1);
    expect((await formulaParser.parse("SUM(2,2)")).result).toBe(4);
    expect((await formulaParser.parse("SUM(A1,2)")).result).toBe(14);
    expect((await formulaParser.parse("SUM(A1:A3)")).result).toBe(36);
    expect((await formulaParser.parse("SUM(A1:A3)")).resultType).toBe("number");
    expect((await formulaParser.parse('CONCAT(A1, "hello")')).resultType).toBe(
      "string"
    );
    expect((await formulaParser.parse("SUM(Sheet:A1, A2)")).result).toBe(24);
    expect(
      (
        await formulaParser.parse("SUM(A1, 2)", undefined, () => ({
          text: "20",
          datatype: "number",
        }))
      ).result
    ).toBe(22);
  });

  it("can parse async functions", async () => {
    const asyncParser = new FormulaParser({
      functions: {
        SUMMER: async () => {
          return "hello";
        },
      },
      rowCount: 100,
      columnCount: 100,
      getMinMaxRows,
      getMinMaxColumns,
    });
    const result = await asyncParser.parse("SUMMER()");
    expect(result.result).toBe("hello");
  });

  it("can parse custom functions", async () => {
    const done = jest.fn((args) => args);
    const fns = {
      FOO: () => {
        return "bar";
      },
    };
    const customParser = new FormulaParser({
      functions: fns,
      rowCount: 100,
      columnCount: 100,
      getMinMaxRows,
      getMinMaxColumns,
    });
    const result = await customParser.parse("FOO()");
    expect(result.result).toBe("bar");
  });

  it("can parse dependencies", () => {
    let deps = formulaParser.getDependencies("SUM(A1, Sheet2!B2)");
    // expect(deps[0].address).toBe('A1')
    expect(deps[0].sheet).toBe("Sheet1");
    expect(deps[1].sheet).toBe("Sheet2");
  });
});
