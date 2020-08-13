import React, { useRef, useEffect, useCallback, useMemo } from "react";
import CalcEngine, {
  CellConfig as CalcCellConfig,
  CellConfigGetter as CalcCellConfigGetter,
} from "@rowsncolumns/calc";
import { CellInterface, castToString } from "@rowsncolumns/grid";
import {
  SheetID,
  CellsBySheet,
  CellConfig,
  FormulaMap,
  CellConfigBySheetNameGetter,
} from "./../Spreadsheet";
import { formulas as defaultFormulas } from "../formulas";

export interface UseCalcOptions {
  formulas?: FormulaMap;
  getCellConfig: React.MutableRefObject<
    CellConfigBySheetNameGetter | undefined
  >;
  rowCount: number;
  columnCount: number;
  getMinMaxRows: (id: SheetID) => number[];
  getMinMaxColumns: (id: SheetID, rowIndex: number) => number[];
}

const useCalc = ({
  formulas,
  getCellConfig,
  rowCount,
  columnCount,
  getMinMaxRows,
  getMinMaxColumns,
}: UseCalcOptions) => {
  const engine = useRef<CalcEngine>();
  useEffect(() => {
    engine.current = new CalcEngine({
      functions: {
        ...defaultFormulas,
        ...formulas,
      },
      rowCount,
      columnCount,
      getMinMaxRows,
      getMinMaxColumns,
    });
  }, []);

  /**
   * Keep row and column count in syncc
   */
  useEffect(() => {
    engine.current?.parser.updateRowColumnCount(rowCount, columnCount);
  }, [rowCount, columnCount]);

  useEffect(() => {
    if (!engine.current) {
      return;
    }
    engine.current.parser.getMinMaxRows = getMinMaxRows;
    engine.current.parser.getMinMaxColumns = getMinMaxColumns;
  }, [getMinMaxRows, getMinMaxColumns]);

  const onCalculate = useCallback(
    (
      value: React.ReactText,
      sheet: SheetID,
      cell: CellInterface
    ): Promise<CellsBySheet | undefined> | undefined => {
      const sheetId = castToString(sheet);
      if (!sheetId || !getCellConfig.current) return;
      return engine.current?.calculate(
        castToString(value) || "",
        sheetId,
        cell,
        getCellConfig.current as CalcCellConfigGetter
      );
    },
    []
  );

  const onCalculateBatch = useCallback((sheet: SheetID, changes: CellsBySheet):
    | Promise<CellsBySheet | undefined>
    | undefined => {
    const sheetId = castToString(sheet);
    if (!sheetId || !getCellConfig?.current) return;
    return engine.current?.calculateBatch(
      sheetId,
      changes as Partial<CellConfig>,
      getCellConfig.current as CalcCellConfigGetter
    );
  }, []);

  const initializeEngine = useCallback((changes: CellsBySheet):
    | Promise<CellsBySheet | undefined>
    | undefined => {
    if (!getCellConfig?.current) return;
    return engine.current?.initialize(
      changes as Partial<CellConfig>,
      getCellConfig.current as CalcCellConfigGetter
    );
  }, []);

  const supportedFormulas: string[] = useMemo(() => {
    return engine.current?.parser.formulaParser.supportedFunctions() ?? [];
  }, [engine.current]);

  const getDepedencies = useCallback((text: string) => {
    return engine.current?.parser.getDependencies(text);
  }, []);

  return {
    onCalculate,
    onCalculateBatch,
    initializeEngine,
    supportedFormulas,
    getDepedencies,
  };
};

export default useCalc;
