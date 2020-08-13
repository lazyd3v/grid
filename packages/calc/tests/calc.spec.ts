// @ts-nocheck
import CalcEngine, { CellsBySheet } from "./../src/calc";
import { Node } from "./../src/graph";
import { CellInterface } from "../src/parser";

describe("Calc Engine", () => {
  let engine: CalcEngine;
  beforeEach(() => {
    engine = new CalcEngine({
      rowCount: 100,
      columnCount: 100,
    });
  });
  it("exists", () => {
    expect(CalcEngine).toBeDefined();
  });

  it("can initialize", async () => {
    const data: CellsBySheet = {
      "sheet 1": {
        1: {
          2: {
            text: "=SUM(A1, A2)",
            datatype: "formula",
          },
        },
      },
    };
    await engine.initialize(data, () => {
      return {
        text: "12",
      };
    });
    const nodeB1 = engine.mapping.get("B1", "sheet 1", {
      rowIndex: 1,
      columnIndex: 2,
    }) as Node;
    expect(
      engine.mapping
        .get("A1", "sheet 1", { rowIndex: 1, columnIndex: 1 })
        ?.children.has(nodeB1)
    ).toBe(true);
  });

  it("can calculate", async () => {
    const sheet = "sheet 1";
    const cell = { rowIndex: 1, columnIndex: 2 };
    const getValue = (sheet: string, cell: CellInterface) => {
      if (cell.rowIndex === 1 && cell.columnIndex === 2) {
        return {
          text: "=SUM(A1, 20)",
          datatype: "formula",
        };
      }
      return {
        text: "200",
        datatype: "number",
      };
    };
    const results = await engine.calculate(
      "=SUM(A1, 20)",
      sheet,
      cell,
      getValue
    );
    expect(results[sheet][cell.rowIndex][cell.columnIndex].result).toBe(220);
  });

  it("can do nested calculations", async () => {
    const sheet = "sheet 1";
    const cell = { rowIndex: 1, columnIndex: 2 };
    const getValue = (sheet: string, cell: CellInterface) => {
      if (cell.rowIndex === 1 && cell.columnIndex === 2) {
        return {
          text: "=SUM(A1, B2)",
          datatype: "formula",
        };
      }
      if (cell.rowIndex === 2 && cell.columnIndex === 2) {
        return {
          text: "=SUM(C2, 10)",
          datatype: "formula",
          result: 20,
        };
      }
      return {
        text: "200",
        datatype: "number",
      };
    };
    const results = await engine.calculate(
      "=SUM(A1, B2)",
      sheet,
      cell,
      getValue
    );
    expect(results[sheet][cell.rowIndex][cell.columnIndex].result).toBe(220);
  });

  it("can update results", async () => {
    const sheet = "sheet 1";
    const cell = { rowIndex: 1, columnIndex: 2 };
    let getValue = (sheet, curCell) => {
      if (
        curCell.rowIndex === cell.rowIndex &&
        curCell.columnIndex === cell.columnIndex
      ) {
        return {
          datatype: "formula",
        };
      }
      return {
        text: "20",
        datatype: "number",
      };
    };
    // B1 = SUM(A1, B2)
    let results = await engine.calculate("=SUM(A1, B2)", sheet, cell, getValue);
    expect(results[sheet][cell.rowIndex][cell.columnIndex].result).toBe(40);

    // Update A1
    let newGetValue = (sheet, curCell) => {
      if (
        curCell.rowIndex === cell.rowIndex &&
        curCell.columnIndex === cell.columnIndex
      ) {
        return {
          datatype: "formula",
          result: 40,
        };
      }
      if (curCell.rowIndex === 1 && curCell.columnIndex === 1) {
        return {
          datatype: "number",
          text: 100,
        };
      }
      return {
        text: "20",
        datatype: "number",
      };
    };

    results = await engine.calculate("=SUM(A1, B2)", sheet, cell, newGetValue);
    expect(results[sheet][cell.rowIndex][cell.columnIndex].result).toBe(120);
  });

  it("can do cross sheet references", async () => {
    const sheet1 = "sheet1";
    const sheet2 = "sheet2";
    const cell = { rowIndex: 1, columnIndex: 2 };
    const getValue = (sheet: string, cell: CellInterface) => {
      if (sheet === sheet1 && cell.rowIndex === 1 && cell.columnIndex === 2) {
        return {
          datatype: "formula",
        };
      }
      if (cell.rowIndex === 1 && cell.columnIndex === 1 && sheet === sheet2) {
        return {
          text: 10,
          datatype: "number",
        };
      }
      if (cell.rowIndex === 2 && cell.columnIndex === 2) {
        return {
          text: "=SUM(C2, 10)",
          datatype: "formula",
          result: 20,
        };
      }
    };
    const results = await engine.calculate(
      "=SUM(sheet2!A1, B2)",
      sheet1,
      cell,
      getValue
    );
    expect(results[sheet1][cell.rowIndex][cell.columnIndex].result).toBe(30);
  });
});
