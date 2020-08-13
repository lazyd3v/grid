import React, { useState } from "react";
import { Token } from "fast-formula-parser/grammar/lexing";
import { createEditor, Editor, Transforms, Node } from "slate";
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderLeafProps,
} from "slate-react";
import { withHistory } from "slate-history";
import {
  normalizeTokens,
  tokenize,
  detokenize,
  fillFormula,
} from "./../formulas/helpers";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import {
  getCurrentCursorOffset,
  functionSuggestion,
  showCellSuggestions,
  getPreviousToken,
  getCurrentToken,
  getSurroundingTokens,
} from "./helpers";
import { Direction } from "@rowsncolumns/grid";

describe("Parsing", () => {
  let editor: Editor & ReactEditor;
  let App;
  let defaultValue = [{ children: [{ text: "" }] }];
  let c = "<cursor>";
  let clen = c.length;
  const cleanup = (value: string): [string, number] => {
    const cidx = value.indexOf(c);
    const val = value.substr(0, cidx) + value.substr(cidx + clen);
    return [val, cidx];
  };
  beforeEach(() => {
    editor = withHistory(withReact(createEditor()));
    App = () => {
      const [value, setValue] = useState<Node[]>(defaultValue);
      return (
        <Slate editor={editor} value={value} onChange={setValue}>
          <Editable />
        </Slate>
      );
    };
  });
  it("exists", () => {
    expect(Slate).toBeDefined();
  });

  it("gets current offset", () => {
    const value = "=SUM(A1:A2)";
    const app = render(<App />);
    ReactEditor.focus(editor);
    editor.insertNode({
      text: value,
    });
    const start = getCurrentCursorOffset(editor);
    expect(start).toBeDefined();
    expect(start.offset).toBe(value.length);
  });

  it("can parse functions", () => {
    const app = render(<App />);
    const [value, distance] = cleanup("=S<cursor>UM(A1:A2)");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens = normalizeTokens(value);
    const fnToken: Token = functionSuggestion(tokens, editor);
    expect(fnToken.image).toBe("SUM(");
  });

  it("can parse nested functions", () => {
    const app = render(<App />);
    const [value, distance] = cleanup("=SUM(SEAR<cursor>");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens = normalizeTokens(value);
    const fnToken: Token = functionSuggestion(tokens, editor);
    expect(fnToken.image).toBe("SEAR");
  });

  it("can parse conditions", () => {
    const app = render(<App />);
    const [value, distance] = cleanup("=SUM(A1, A2, IF<cursor>");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens = normalizeTokens(value);
    const fnToken: Token = functionSuggestion(tokens, editor);
    expect(fnToken.image).toBe("IF");
  });

  it("Should show suggestion cursor", () => {
    const app = render(<App />);
    let [value, distance] = cleanup("=SUM(A1, A2, <cursor>");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens: Token[] = normalizeTokens(value);

    let showCursor: boolean = showCellSuggestions(editor, tokens);
    expect(showCursor).toBeTruthy();
  });

  it("Should hide suggestion cursor", () => {
    const app = render(<App />);
    let [value, distance] = cleanup("=SUM(A1, A2<cursor>");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens: Token[] = normalizeTokens(value);

    let showCursor: boolean = showCellSuggestions(editor, tokens);
    expect(showCursor).toBeFalsy();
  });

  it("Should hide suggestion cursor in function boundary", () => {
    const app = render(<App />);
    let [value, distance] = cleanup("=SUM(A1, A2) <cursor>");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens: Token[] = normalizeTokens(value);

    let showCursor: boolean = showCellSuggestions(editor, tokens);
    expect(showCursor).toBeFalsy();
  });

  it("Should hide suggestion cursor in function boundary", () => {
    const app = render(<App />);
    let [value, distance] = cleanup("=SUM(A1,A2) + B1  <cursor>");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens: Token[] = normalizeTokens(value);

    let showCursor: boolean = showCellSuggestions(editor, tokens);
    expect(showCursor).toBeFalsy();
  });
  it("Should hide suggestion cursor in inside functions", () => {
    const app = render(<App />);
    let [value, distance] = cleanup("=SUM(A1,<cursor>2)");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens: Token[] = normalizeTokens(value);

    let showCursor: boolean = showCellSuggestions(editor, tokens);
    expect(showCursor).toBeFalsy();
  });
  it("Should hide suggestion cursor between functions", () => {
    const app = render(<App />);
    let [value, distance] = cleanup("=SU<cursor>M()");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens: Token[] = normalizeTokens(value);

    let showCursor: boolean = showCellSuggestions(editor, tokens);
    expect(showCursor).toBeFalsy();
  });
  it("Should show suggestion cursor after functions", () => {
    const app = render(<App />);
    let [value, distance] = cleanup("=INDEX(<cursor>");
    editor.insertNode({
      text: value,
    });
    Transforms.move(editor, { unit: "line", reverse: true });
    Transforms.move(editor, { unit: "character", distance }); // User's cursor is at =S<cursor>
    const tokens: Token[] = normalizeTokens(value);

    let showCursor: boolean = showCellSuggestions(editor, tokens);
    expect(showCursor).toBeTruthy();
  });
});

describe("tokenize/detokenize", () => {
  const text = "=SUM(A1, 20)";
  it("tokenizes", () => {
    const { tokens } = tokenize(text);
    expect(tokens.length).toBe(6);
  });

  it("detokenizes", () => {
    const { tokens } = tokenize(text);
    expect(detokenize(tokens)).toBe(text);
  });
});

describe("fillFormula", () => {
  it("can fill formulas downwards", () => {
    const newformula = fillFormula("=SUM(A1,2)", 1, Direction.Down);
    expect(newformula).toBe("=SUM(A2,2)");

    expect(fillFormula("=SUM(Sheet1!A1,2)", 1, Direction.Down)).toBe(
      "=SUM(Sheet1!A2,2)"
    );
  });

  it("can fill formulas upwards", () => {
    const newformula = fillFormula("=SUM(A2,2)", -1, Direction.Up);
    expect(newformula).toBe("=SUM(A1,2)");

    expect(fillFormula("=SUM(Sheet1!A2,2)", -1, Direction.Up)).toBe(
      "=SUM(Sheet1!A1,2)"
    );
  });

  it("can fill formulas to the right", () => {
    const newformula = fillFormula("=SUM(A1,2)", 1, Direction.Right);
    expect(newformula).toBe("=SUM(B1,2)");

    expect(fillFormula("=SUM(Sheet1!A1,2)", 1, Direction.Right)).toBe(
      "=SUM(Sheet1!B1,2)"
    );
  });

  it("can fill formulas to the left", () => {
    const newformula = fillFormula("=SUM(B1,2)", -1, Direction.Left);
    expect(newformula).toBe("=SUM(A1,2)");

    expect(fillFormula("=SUM(Sheet1!B1,2)", -1, Direction.Left)).toBe(
      "=SUM(Sheet1!A1,2)"
    );
  });
});
