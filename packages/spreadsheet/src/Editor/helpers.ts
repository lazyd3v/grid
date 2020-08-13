import { Editor, Range } from "slate";
import { Token } from "fast-formula-parser/grammar/lexing";
import { normalizeTokens } from "../formulas/helpers";

export const cleanFunctionToken = (text: string) => {
  return text.replace(new RegExp(/\(|\)/, "gi"), "");
};

export const functionSuggestion = (
  tokens: Token[],
  editor: Editor
): Token | undefined => {
  const start = getCurrentCursorOffset(editor);
  if (start) {
    const charBefore = Editor.before(editor, start, { unit: "character" });
    const range = Editor.range(editor, start, charBefore);
    const str = Editor.string(editor, range);
    const token = tokens.find(
      (token) =>
        start.offset >= token.startOffset && start.offset <= token.endColumn
    );

    return token &&
      str !== "(" &&
      (token.tokenType.name === "Column" ||
        token.tokenType.name === "Name" ||
        token.tokenType.name === "Function" ||
        token.tokenType.name === "ExcelConditionalRefFunction")
      ? token
      : void 0;
  }
  return void 0;
};

export const isTokenACell = (token?: Token | null) => {
  return (
    token &&
    (token.tokenType.name === "Column" || token.tokenType.name === "Cell")
  );
};

export const getCurrentCursorOffset = (editor: Editor) => {
  const { selection } = editor;
  if (selection && Range.isCollapsed(selection)) {
    const [start] = Range.edges(selection);
    return start;
  }
  return void 0;
};

export const showCellSuggestions = (editor: Editor, tokens: Token[]) => {
  const [prev, cur, next] = getSurroundingTokens(tokens, editor);
  const start = getCurrentCursorOffset(editor);
  const ops = [
    ...operators,
    "Comma",
    "Function",
    "ExcelConditionalRefFunction",
    "QuoteS",
  ];
  const parens = [
    "CloseParen",
    "CloseSquareParen",
    "CloseCurlyParen",
    "QuoteS",
  ];
  const nextOps = ["Comma", ...parens];
  // console.log('d', start, prevToken, curToken, nextToken)
  if (next && next.tokenType.name === "Cell") {
    return false;
  }

  if (
    start &&
    cur &&
    cur.tokenType.name === "Function" &&
    start.offset < cur.endColumn
  ) {
    return false;
  }

  if (
    start &&
    cur &&
    cur.tokenType.name === "Cell" &&
    start.offset < cur.endColumn
  ) {
    return false;
  }
  if (
    next &&
    nextOps.includes(next.tokenType.name) &&
    cur &&
    cur.tokenType.name !== "Comma" &&
    cur.tokenType.name !== "Function" &&
    cur.tokenType.name !== next.tokenType.name // to remove spaces
  ) {
    return false;
  }

  if (
    next &&
    ["Cell", "Function", "OpenParens", "Number"].includes(next.tokenType.name)
  ) {
    return false;
  }

  return (
    (start &&
      prev &&
      ops.includes(prev.tokenType.name) &&
      start.offset > prev.endOffset) ||
    (next && nextOps.includes(next.tokenType.name))
  );
};

export const isCurrentPositionACell = (editor: Editor, tokens: Token[]) => {
  const token = getCurrentToken(tokens, editor);
  return isTokenACell(token);
};

export const getSurroundingTokens = (tokens: Token[], editor: Editor) => {
  const previous = getPreviousToken(tokens, editor);
  const cur = getCurrentToken(tokens, editor);
  const next = getNextToken(tokens, editor);

  return [previous, cur, next];
};

export const getCurrentToken = (tokens: Token[], editor: Editor) => {
  const { selection } = editor;
  if (selection && Range.isCollapsed(selection)) {
    const [start] = Range.edges(selection);
    return tokens.find((token) => token.endColumn >= start.offset);
  }
  return void 0;
};

export const getPreviousToken = (
  tokens: Token[],
  editor: Editor
): Token | undefined => {
  const start = getCurrentCursorOffset(editor);
  let i = 0;
  let token;
  if (start) {
    while (i < tokens.length) {
      token = tokens[i];
      if (token.startColumn > start.offset) {
        token = tokens[i - 1];
        break;
      }
      i++;
    }
    return token;
  }
};

export const getNextToken = (
  tokens: Token[],
  editor: Editor
): Token | undefined => {
  const start = getCurrentCursorOffset(editor);
  if (!start) return void 0;
  return tokens.find((token) => {
    return token.startOffset >= start.offset;
  });
};

export const operators = [
  "MulOp",
  "PlusOp",
  "DivOp",
  "MinOp",
  "ConcatOp",
  "ExOp",
  "MulOp",
  "PercentOp",
  "NeqOp",
  "GteOp",
  "LteOp",
  "GtOp",
  "EqOp",
  "LtOp",
];

export const operatorTokenNames = [
  "At",
  "Comma",
  "Cell",
  "Function",
  // "Colon",
  // "Semicolon",
  "OpenParen",
  // "CloseParen",
  // "OpenSquareParen",
  // "CloseSquareParen",
  // // ExclamationMark,
  // "OpenCurlyParen",
  // "CloseCurlyParen",
  // "QuoteS",
  ...operators,
];

export const createSlateChildren = (text: string) => {
  const tokens = normalizeTokens(text);
  let leafs = [];
  let prevToken = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    leafs.push({
      text: (prevToken !== token.startOffset ? " " : "") + token.image,
      index: token.index,
      selection: !!token.sel,
    });
    prevToken = token.endColumn;
  }
  return leafs;
};
