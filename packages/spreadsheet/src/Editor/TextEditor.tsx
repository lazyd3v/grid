import React, {
  memo,
  forwardRef,
  useMemo,
  useState,
  useEffect,
  useImperativeHandle,
  useCallback
} from "react";
import {
  createEditor,
  Node,
  Transforms,
  NodeEntry,
  Range,
  Editor
} from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import { Direction, KeyCodes, SelectionArea } from "@rowsncolumns/grid";
import useShiftDown from "../hooks/useShiftDown";
import { useColorMode, useTheme, Box } from "@chakra-ui/core";
import { DARK_MODE_COLOR, FORMULA_FONT } from "../constants";
import { normalizeTokens, tokenVocabulary } from "./../FormulaInput/helpers";

export interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string, direction?: Direction) => void;
  onCancel: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  fontFamily: string;
  fontSize: number;
  scale: number;
  color: string;
  wrapping: any;
  horizontalAlign: any;
  underline?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  options?: string[];
  isFormulaMode?: boolean;
  autoFocus?: boolean;
  supportedFormulas?: string[];
}

export type RefAttribute = {
  ref?: React.Ref<EditableRef | null>;
};

export type EditableRef = {
  focus: () => void;
  updateSelection?: (sel: SelectionArea) => void;
};

export const cleanFunctionToken = (text: string) => {
  return text; //.replace(new RegExp(/\(|\)/, 'gi'), '')
};

const TextEditor: React.FC<EditableProps & RefAttribute> = memo(
  forwardRef((props, forwardedRef) => {
    const {
      value: initialValue,
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
      options,
      isFormulaMode,
      autoFocus,
      supportedFormulas = [],
      ...rest
    } = props;
    const [target, setTarget] = useState<Range | undefined>();
    const serialize = useCallback((value: string): Node[] => {
      return value.split("\n").map((line: string) => {
        return {
          children: [
            {
              text: line
            }
          ]
        };
      });
    }, []);
    useImperativeHandle(
      forwardedRef,
      () => {
        return {
          focus: () => {
            ReactEditor.focus(editor);
          },
          updateSelection: (sel: SelectionArea | undefined) => {
            console.log("called");
          }
        };
      },
      []
    );
    const deserialize = useCallback((value: Node[]) => {
      return value
        .map(element => {
          // @ts-ignore
          return element.children.map(leaf => leaf.text).join("\n");
        })
        .join("\n");
    }, []);
    const [value, setValue] = useState<Node[]>(() => serialize(initialValue));
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const moveToEnd = useCallback(() => {
      ReactEditor.focus(editor);
      document.execCommand("selectAll", false, undefined);
      // collapse selection to the end
      document.getSelection()?.collapseToEnd();
    }, []);
    useEffect(() => {
      if (autoFocus) {
        requestAnimationFrame(moveToEnd);
      }
    }, []);

    const {
      highlightedIndex,
      onKeyDown: onShiftDownKeyDown,
      setInputValue,
      menuRef,
      selectedItem,
      items,
      onMouseMove,
      onMouseDown,
      onClick
    } = useShiftDown({
      initialInputValue: initialValue,
      initialIsOpen: true,
      initialSelectedItem: initialValue,
      options: isFormulaMode ? supportedFormulas : options,
      onChange: item => {
        if (isFormulaMode && target) {
          // User is selecting functions
          Transforms.select(editor, target);
          Transforms.insertNodes(editor, { text: `${item as string}()` });
          Transforms.move(editor, { distance: 1, reverse: true });
          setTarget(void 0);
          return;
        }
        onSubmit?.(item as string);
      }
    });
    const decorate = useCallback(
      (entry: NodeEntry<Node>) => {
        if (!isFormulaMode) {
          return [];
        }
        const [node, path] = entry;
        const { text } = node;
        // const tokens = normalizeTokens(text)
        // console.log('tokens', tokens)
        return [];
      },
      [isFormulaMode]
    );

    useEffect(() => {
      const normalizedValue = deserialize(value);
      if (!isFormulaMode) {
        setInputValue(normalizedValue);
      }
      onChange?.(normalizedValue);
    }, [value]);

    useEffect(() => {
      /* Update editor text if initialValue changes, when user enters text in formula bar */
      if (deserialize(value) !== initialValue) {
        setValue(serialize(initialValue));
      }
    }, [initialValue]);

    const theme = useTheme();
    const { colorMode } = useColorMode();
    const isLight = colorMode === "light";
    const borderColor = isLight
      ? theme.colors.gray[300]
      : theme.colors.gray[600];
    const inputColor = isLight ? DARK_MODE_COLOR : theme.colors.white;
    const dropdownBgColor = isLight
      ? theme.colors.white
      : theme.colors.gray[700];

    return (
      <>
        <div
          style={{
            fontFamily: isFormulaMode ? FORMULA_FONT : fontFamily,
            fontSize: (isFormulaMode ? 13 : fontSize) * scale,
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
            textAlign: isFormulaMode ? "left" : horizontalAlign,
            lineHeight: "normal",
            textDecoration: underline ? "underline" : "none",
            cursor: "text"
          }}
        >
          <Slate
            editor={editor}
            value={value}
            onChange={value => {
              setValue(value);
            }}
          >
            <Editable
              decorate={decorate}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                const isShiftKey = e.nativeEvent.shiftKey;
                const isMetaKey =
                  e.nativeEvent.metaKey || e.nativeEvent.ctrlKey;
                const text =
                  highlightedIndex === null
                    ? deserialize(value)
                    : items[highlightedIndex];

                onKeyDown?.(e);

                if (isFormulaMode) {
                  onShiftDownKeyDown(e);
                }

                if (e.which !== KeyCodes.Enter && !isFormulaMode) {
                  onShiftDownKeyDown(e);
                }

                // Enter key
                if (e.which === KeyCodes.Enter) {
                  /* Add a new line when Cmd/Ctrl key is pressed */
                  if (isMetaKey) {
                    editor.insertBreak();
                    return;
                  }
                  onSubmit?.(text, isShiftKey ? Direction.Up : Direction.Down);

                  e.preventDefault();
                }

                if (e.which === KeyCodes.Escape) {
                  onCancel && onCancel(e);
                }

                if (e.which === KeyCodes.Tab) {
                  /* Trap focus inside the grid */
                  e.preventDefault();
                  onSubmit &&
                    onSubmit(
                      text,
                      isShiftKey ? Direction.Left : Direction.Right
                    );
                }
              }}
            />
          </Slate>
        </div>
        {items?.length ? (
          <Box
            ref={menuRef}
            width="auto"
            left="-2px"
            shadow="md"
            background={dropdownBgColor}
            pb={1}
            pt={1}
            position="absolute"
            top="100%"
            mt="2px"
            borderColor={borderColor}
            borderStyle="solid"
            borderWidth={1}
            minWidth="calc(100% + 4px)"
            maxHeight={400}
            overflow="auto"
          >
            {items.map((item, index) => {
              return (
                <Box
                  fontSize={12}
                  padding={1}
                  pl={2}
                  pr={2}
                  whiteSpace="nowrap"
                  color={inputColor}
                  cursor="pointer"
                  onMouseMove={() => onMouseMove?.(index)}
                  onMouseDown={onMouseDown}
                  onClick={() => onClick?.(item)}
                  key={item}
                  style={{
                    fontWeight: selectedItem === item ? "bold" : "normal",
                    backgroundColor:
                      highlightedIndex === index
                        ? isLight
                          ? theme.colors.gray[100]
                          : "rgba(255,255,255,0.06)"
                        : dropdownBgColor
                  }}
                >
                  {item}
                </Box>
              );
            })}
          </Box>
        ) : null}
      </>
    );
  })
);

export default TextEditor;
