import {
  createStateReducer,
  ACTION_TYPE,
  StateInterface,
  ActionTypes,
} from "./state";
import { initialState } from "./Spreadsheet";
import { createNewSheet } from ".";
import { CellsBySheet } from "@rowsncolumns/calc/dist/calc";

type StateReducer = (
  state: StateInterface,
  action: ActionTypes
) => StateInterface;

describe("state reducers", () => {
  let reducer: StateReducer;
  let undoCallback = jest.fn();
  let getCellBounds = () => ({
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
  });
  beforeEach(() => {
    reducer = createStateReducer({ addUndoPatch: undoCallback, getCellBounds });
  });

  it("creates a reducer", () => {
    expect(reducer).toBeDefined();
  });

  it("can change sheet", () => {
    const newState = reducer(initialState, {
      type: ACTION_TYPE.SELECT_SHEET,
      id: "sheet_id",
    });

    expect(newState.selectedSheet).toBe("sheet_id");
  });

  it("can change sheet name", () => {
    const id = initialState.sheets[0].id;
    const newState = reducer(initialState, {
      type: ACTION_TYPE.CHANGE_SHEET_NAME,
      id,
      name: "Hello world",
    });

    expect(newState.sheets.find((sheet) => sheet.id === id)?.name).toBe(
      "Hello world"
    );
  });

  it("can add new sheet", () => {
    const newState = reducer(initialState, {
      type: ACTION_TYPE.NEW_SHEET,
      sheet: createNewSheet({ count: 2 }),
    });

    expect(newState.sheets.length).toBe(2);
    expect(newState.sheets[1].name).toBe("Sheet2");
  });

  it("can add new sheet at a index", () => {
    const state = {
      ...initialState,
      sheets: [...initialState.sheets, createNewSheet({ count: 1 })],
    };
    const newState = reducer(initialState, {
      type: ACTION_TYPE.NEW_SHEET,
      sheet: createNewSheet({ count: 2 }),
      index: 0,
    });

    expect(newState.sheets.length).toBe(2);
    expect(newState.sheets[1].name).toBe("Sheet2");
  });

  it("can change a cell", () => {
    const newState = reducer(initialState, {
      type: ACTION_TYPE.CHANGE_SHEET_CELL,
      id: initialState.sheets[0].id,
      cell: { rowIndex: 1, columnIndex: 1 },
      value: "Hello",
      datatype: "string",
    });

    expect(newState.sheets[0].cells[1]).toBeDefined();
    expect(newState.sheets[0].cells[1][1].text).toBe("Hello");
    expect(newState.sheets[0].cells[1][1].datatype).toBe("string");
  });

  it("can delete formula references on change cell", () => {
    const sheetName = "Sheet1";
    const changes: CellsBySheet = {
      [sheetName]: {
        1: {
          1: {
            text: "=A1:B2",
            datatype: "formula",
            resultType: "array",
            formulaRange: [2, 2], // [spans 2 cells horizontally, span 2 cells vertically]
          },
          2: {
            text: "2",
            result: 2,
            resultType: "number",
            parentCell: "A1",
          },
        },
      },
    };
    /* 1: Calculation update a group of cells */
    const newState = reducer(initialState, {
      type: ACTION_TYPE.UPDATE_CELLS,
      changes,
    });
    expect(newState.sheets[0].cells[1][1].text).toBe("=A1:B2");
    expect(newState.sheets[0].cells[1][1].formulaRange).toEqual([2, 2]);

    /* User now updates a cell */
    const stateAfterUpdate = reducer(newState, {
      type: ACTION_TYPE.CHANGE_SHEET_CELL,
      id: newState.sheets[0].id,
      cell: { rowIndex: 1, columnIndex: 1 },
      value: "Hello",
      datatype: "string",
    });

    expect(stateAfterUpdate.sheets[0].cells[1][1].text).toBe("Hello");
    expect(stateAfterUpdate.sheets[0].cells[1][1].formulaRange).toBeUndefined();
    // Deletes the formularange
    expect(stateAfterUpdate.sheets[0].cells[1][2]).toBeUndefined();
  });

  it("can batch updates cells", () => {
    const sheetName = "Sheet1";
    const changes: CellsBySheet = {
      [sheetName]: {
        1: {
          1: {
            text: '=HYPERLINK("Google", www.google.com)',
            datatype: "formula",
            resultType: "hyperlink",
          },
        },
      },
    };
    /* 1: Calculation update a group of cells */
    const newState = reducer(initialState, {
      type: ACTION_TYPE.UPDATE_CELLS,
      changes,
    });
    expect(newState.sheets[0].cells[1][1].resultType).toEqual("hyperlink");
  });

  it("can update cells after validation", () => {
    const id = initialState.sheets[0].id;
    const newState = reducer(initialState, {
      type: ACTION_TYPE.VALIDATION_SUCCESS,
      id,
      cell: { rowIndex: 1, columnIndex: 1 },
      valid: false,
      prompt: "Please enter your name",
    });

    expect(newState.sheets[0].cells[1][1].valid).toBeFalsy();
    expect(newState.sheets[0].cells[1][1].dataValidation?.prompt).toBe(
      "Please enter your name"
    );
  });

  it("can handle cell filling", () => {
    const state = {
      ...initialState,
      sheets: initialState.sheets.map((sheet) => {
        return {
          ...sheet,
          cells: {
            5: {
              2: {
                text: "Hello",
              },
            },
          },
        };
      }),
    };
    const id = state.sheets[0].id;
    const newState = reducer(state, {
      type: ACTION_TYPE.UPDATE_FILL,
      id,
      activeCell: {
        rowIndex: 5,
        columnIndex: 2,
      },
      // Extended selection
      fillSelection: {
        bounds: {
          top: 5,
          bottom: 8,
          left: 2,
          right: 5,
        },
      },
      // Original selection
      selections: [
        {
          bounds: {
            top: 5,
            left: 2,
            right: 5,
            bottom: 5,
          },
        },
      ],
    });

    expect(newState.sheets[0].cells[6][2].text).toBe("Hello");
    expect(newState.sheets[0].cells[7][2].text).toBe("Hello");
    expect(newState.sheets[0].cells[8][2].text).toBe("Hello");
  });
});
