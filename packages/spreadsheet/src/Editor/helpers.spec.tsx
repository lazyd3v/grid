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
import { normalizeTokens } from "./../formulas/helpers";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import {
  getCurrentCursorOffset,
  functionSuggestion,
  showCellSuggestions,
  getPreviousToken,
  getCurrentToken,
  getSurroundingTokens,
} from "./helpers";

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
