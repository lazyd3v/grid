import React from "react";
import { konvaRenderer, cleanup } from "./../utils/test-utils";
import Checkbox from "./Checkbox";

describe("Cell", () => {
  afterEach(cleanup);
  it("renders a cell", () => {
    const renderCell = () =>
      konvaRenderer(<Checkbox checked rowIndex={1} columnIndex={1} />);
    expect(renderCell).not.toThrow();
  });
  it("matches snapshot", () => {
    const { asFragment } = konvaRenderer(
      <Checkbox checked rowIndex={1} columnIndex={1} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
