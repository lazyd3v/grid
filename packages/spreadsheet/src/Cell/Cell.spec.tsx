import React from "react";
import { konvaRenderer, cleanup } from "./../utils/test-utils";
import Cell from "./Cell";

describe("Cell", () => {
  afterEach(cleanup);
  it("renders a cell", () => {
    const renderCell = () =>
      konvaRenderer(
        <Cell key="1:1" text="hello world" rowIndex={1} columnIndex={1} />
      );
    expect(renderCell).not.toThrow();
  });
  it("matches snapshot", () => {
    const { asFragment } = konvaRenderer(
      <Cell key="1:1" text="hello world" rowIndex={1} columnIndex={1} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
