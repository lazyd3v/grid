import { getSelectionsFromInput, normalizeTokens } from "./helpers";

describe("Extract cell selection from raw text", () => {
  it("exists", () => {
    expect(getSelectionsFromInput).toBeDefined();
  });

  it("can parse single cells", () => {
    const text = "=A1";
    const selections = getSelectionsFromInput(text, 1);
    expect(selections.length).toBe(1);
  });
  it("can parse range cells", () => {
    const text = "=A1:A3";
    const selections = getSelectionsFromInput(text, 2);
    expect(selections.length).toBe(1);
  });
});

describe("getSelectionsFromInput", () => {
  it("can retrieve selections", () => {
    const selections = getSelectionsFromInput("=SUM(A1,A2)", "Sheet1");
    expect(selections.length).toBe(2);
    expect(selections[0].sheet).toBe("Sheet1");
  });

  it("can retrieve selections cross sheet", () => {
    const selections = getSelectionsFromInput("=SUM(A1,Sheet2!A2)", "Sheet1");
    expect(selections.length).toBe(2);
    expect(selections[1].sheet).toBe("Sheet2");
  });

  it("can retrieve selections cross sheet", () => {
    const selections = getSelectionsFromInput("=SUM(A1,Sheet2!A2)", "Sheet1");
    expect(selections.length).toBe(2);
    expect(selections[1].sheet).toBe("Sheet2");
  });

  it("can retrieve selections range", () => {
    const selections = getSelectionsFromInput(
      "=SUM(Sheet2!I10:I17,H5:H10)",
      "Sheet1"
    );
    expect(selections.length).toBe(2);
    expect(selections[0].sheet).toBe("Sheet2");
  });
});
