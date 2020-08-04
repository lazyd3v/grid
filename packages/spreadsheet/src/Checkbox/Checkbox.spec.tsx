import React from "react";
import { konvaRenderer, cleanup } from "test-utils";
import Checkbox from "./Checkbox";

describe("Cell", () => {
  afterEach(cleanup);
  it("renders a cell", () => {
    const renderCell = () => konvaRenderer(<Checkbox />);
    expect(renderCell).not.toThrow();
  });
  it("matches snapshot", () => {
    const { asFragment } = konvaRenderer(<Checkbox />);
    expect(asFragment()).toMatchSnapshot();
  });
});
