import { getSelectionsFromInput, normalizeTokens } from "./helpers";

describe("Extract cell selection from raw text", () => {
  it("exists", () => {
    expect(getSelectionsFromInput).toBeDefined();
  });

  it("can parse single cells", () => {
    const text = "=A1";
    const selections = getSelectionsFromInput(text);
    expect(selections.length).toBe(1);
  });
  it("can parse range cells", () => {
    const text = "=A1:A3";
    const selections = getSelectionsFromInput(text);
    expect(selections.length).toBe(1);
  });
  // it("can parse column range", () => {
  //   const text = "=A:A";
  //   const selections = getSelectionsFromInput(text);
  //   expect(selections.length).toBe(1);
  // });
});

describe("normalizeTokens", () => {});
