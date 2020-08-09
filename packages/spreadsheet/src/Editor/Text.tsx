import React, { forwardRef, useEffect, useRef, memo } from "react";
import { KeyCodes, Direction } from "@rowsncolumns/grid";
import { LINE_HEIGHT_RATIO } from "../constants";

export interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string, direction: Direction) => void;
  onCancel: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  fontFamily: string;
  fontSize: number;
  scale: number;
  color: string;
  wrapping: any;
  horizontalAlign: any;
  underline?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export type RefAttribute = {
  ref?: React.MutableRefObject<HTMLTextAreaElement>;
};

const TextEditor: React.FC<TextEditorProps & RefAttribute> = memo(
  forwardRef((props, forwardedRef) => {
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      /* Focus cursor at the end */
      inputRef.current.selectionStart = value.length;
      if (forwardedRef)
        (forwardedRef as React.MutableRefObject<HTMLTextAreaElement>).current =
          inputRef.current;
    }, []);
    const {
      value,
      onChange,
      onSubmit,
      onCancel,
      fontFamily,
      fontSize,
      scale,
      color,
      wrapping,
      horizontalAlign,
      underline,
      onKeyDown,
      ...rest
    } = props;
    return (
      <textarea
        rows={1}
        cols={1}
        ref={inputRef}
        value={value}
        style={{
          fontFamily,
          fontSize: fontSize * scale,
          width: "100%",
          height: "100%",
          padding: "0 1px",
          margin: 0,
          boxSizing: "border-box",
          borderWidth: 0,
          outline: "none",
          resize: "none",
          overflow: "hidden",
          verticalAlign: "top",
          background: "transparent",
          color: color,
          whiteSpace: "pre-wrap",
          textAlign: horizontalAlign,
          lineHeight: "normal",
          textDecoration: underline ? "underline" : "none",
        }}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          onChange(e.target.value);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (!inputRef.current) return;
          const isShiftKey = e.nativeEvent.shiftKey;
          const isMetaKey = e.nativeEvent.metaKey || e.nativeEvent.ctrlKey;
          const value = inputRef.current.value;

          onKeyDown?.(e);

          // Enter key
          if (e.which === KeyCodes.Enter) {
            /* Add a new line when Cmd/Ctrl key is pressed */
            if (isMetaKey) {
              return onChange(value + "\n");
            }
            onSubmit &&
              onSubmit(value, isShiftKey ? Direction.Up : Direction.Down);
          }

          if (e.which === KeyCodes.Escape) {
            onCancel && onCancel(e);
          }

          if (e.which === KeyCodes.Tab) {
            /* Trap focus inside the grid */
            e.preventDefault();
            onSubmit &&
              onSubmit(value, isShiftKey ? Direction.Left : Direction.Right);
          }
        }}
        {...rest}
      />
    );
  })
);

export default TextEditor;
