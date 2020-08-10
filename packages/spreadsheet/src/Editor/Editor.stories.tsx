import React, { useState } from "react";
import Editor from "./Editor";

export const TextEditor = () => {
  const position = { x: 0, y: 0, width: 200, height: 20 };
  const cell = { rowIndex: 1, columnIndex: 1 };
  const activeCell = { rowIndex: 1, columnIndex: 1 };
  const [value, setValue] = useState("hello world \nno");
  const editorType = "text";
  return (
    <Editor
      position={position}
      value={value}
      onChange={setValue}
      cell={cell}
      activeCell={activeCell}
      editorType={editorType}
    />
  );
};

export const ListEditor = () => {
  const position = { x: 0, y: 0, width: 200, height: 20 };
  const cell = { rowIndex: 1, columnIndex: 1 };
  const activeCell = { rowIndex: 1, columnIndex: 1 };
  const [value, setValue] = useState("USA");
  const editorType = "list";
  const options = ["Singapore", "USA", "Japan"];
  return (
    <Editor
      position={position}
      value={value}
      onChange={setValue}
      cell={cell}
      activeCell={activeCell}
      editorType={editorType}
      options={options}
    />
  );
};

export const FormulaEditor = () => {
  const position = { x: 0, y: 0, width: 200, height: 20 };
  const cell = { rowIndex: 1, columnIndex: 1 };
  const activeCell = { rowIndex: 1, columnIndex: 1 };
  const [value, setValue] = useState("=SUM()");
  const editorType = "formula";
  const options = ["Singapore", "USA", "Japan"];
  return (
    <Editor
      position={position}
      value={value}
      onChange={setValue}
      cell={cell}
      activeCell={activeCell}
      editorType={editorType}
      options={options}
      isFormulaMode
    />
  );
};

export default {
  title: "Editor",
  component: TextEditor
};
