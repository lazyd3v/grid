import React from "react";
import { render, cleanup } from "@testing-library/react";
import SpreadSheet from "./../src/Spreadsheet";

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
