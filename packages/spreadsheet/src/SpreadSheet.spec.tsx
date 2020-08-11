import React, { useState, useRef } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import SpreadSheet, { defaultSheets, SheetGridRef } from "./../src/Spreadsheet";

global.document.execCommand = jest.fn();

describe("SpreadSheet", () => {
  afterEach(cleanup);
  it("renders spreadsheet", () => {
    const renderGrid = () => render(<SpreadSheet />);
    expect(renderGrid).not.toThrow();
  });
  it("matches snapshot", () => {
    const { asFragment } = render(<SpreadSheet />);
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("Copy paste", () => {
  afterEach(cleanup);

  it("triggers onChangeCells when paste is called", async () => {
    let grid;
    const onChangeCells = jest.fn();
    const App = () => {
      return (
        <SpreadSheet
          initialSheets={defaultSheets}
          enableGlobalKeyHandlers
          onChangeCells={onChangeCells}
        />
      );
    };
    act(() => {
      grid = render(<App />);
    });
    await act(async () => {
      fireEvent.paste(document, {
        clipboardData: {
          getData: () =>
            JSON.stringify([
              [
                {
                  text: "hello"
                }
              ]
            ]),
          items: []
        }
      });
    });
    // Activecell = {rowIndex: 1, columnIndex: 1}

    expect(onChangeCells).toBeCalled();
    expect(onChangeCells).toBeCalledWith(defaultSheets[0].id, {
      "1": { "1": { text: "hello" } }
    });
  });
});

describe("Cut paste", () => {
  afterEach(cleanup);

  it("triggers onChangeCells when cut/paste is called", async () => {
    let grid;
    let gridRef = React.createRef<SheetGridRef>();
    const onChangeCells = jest.fn();
    const App = () => {
      return (
        <SpreadSheet
          ref={gridRef}
          initialSheets={defaultSheets}
          enableGlobalKeyHandlers
          onChangeCells={onChangeCells}
        />
      );
    };
    act(() => {
      grid = render(<App />);
    });
    await act(async () => {
      fireEvent.cut(document);
    });
    await act(async () => {
      gridRef.current?.grid?.setActiveCell({ rowIndex: 2, columnIndex: 2 });
    });
    await act(async () => {
      fireEvent.paste(document, {
        clipboardData: {
          getData: () =>
            JSON.stringify([
              [
                {
                  text: "hello"
                }
              ]
            ]),
          items: []
        }
      });
    });
    // Activecell = {rowIndex: 1, columnIndex: 1}

    expect(onChangeCells).toBeCalled();
    expect(onChangeCells).toBeCalledWith(defaultSheets[0].id, {
      1: {
        1: {}
      },
      2: {
        2: {
          text: "hello"
        }
      }
    });
  });
});
