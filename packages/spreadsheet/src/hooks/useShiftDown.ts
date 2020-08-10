import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo
} from "react";
import { KeyCodes } from "@rowsncolumns/grid";

export interface ShiftDownProps {
  initialInputValue?: string;
  initialIsOpen?: boolean;
  initialSelectedItem?: Item | string;
  selectedItem?: Item | string;
  options?: Item[] | string[];
  filterOnInitialOpen?: boolean;
  itemToString?: (item: Item | string) => string;
  onChange?: (item: Item | string | undefined) => void;
  filter?: (item: Item | string) => boolean;
}

export interface Item {
  label: React.ReactText;
  value: any;
}

const defaultItemToString = (text: Item | string) => text as string;

/**
 * Simple DownShift replacement. With types.
 * Using this due to lack of good typing in Downshift
 * @param props
 */
const useShiftDown = (props: ShiftDownProps) => {
  const {
    initialInputValue = "",
    initialIsOpen = false,
    initialSelectedItem,
    options = [],
    filterOnInitialOpen = false,
    itemToString = defaultItemToString,
    onChange,
    filter,
    selectedItem: controlledSelecteditem
  } = props;
  const { current: isControlled } = useRef(controlledSelecteditem !== void 0);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(initialIsOpen);
  const [inputValue, setInputValue] = useState<string>(initialInputValue);
  const [selectedItem, setSelectedItem] = useState<Item | string | undefined>(
    initialSelectedItem
  );
  const menuRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLElement | HTMLInputElement>(null);
  const isDirty = useRef<boolean>(false);

  const handleSetSelectedItem = useCallback(
    (item: Item | string | undefined) => {
      setSelectedItem(item);
      setInputValue(itemToString(item ?? ""));
    },
    []
  );

  useEffect(() => {
    if (!isControlled) return;
    if (controlledSelecteditem === selectedItem) {
      return;
    }
    setInputValue(itemToString(controlledSelecteditem ?? ""));
  }, [isControlled, controlledSelecteditem, selectedItem]);

  const filteredItems = useMemo(() => {
    return (options as any[]).filter(item => {
      if (
        !inputValue ||
        (!isDirty.current && !filterOnInitialOpen && inputValue)
      )
        return true;
      if (filter) return filter(item);
      const key = typeof item === "object" ? item.value || item.label : item;
      return new RegExp(inputValue, "gi").test(key);
    });
  }, [inputValue, options, filter]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<any>) => {
      const keyCode = e.nativeEvent.which;
      if (keyCode === KeyCodes.Up || keyCode === KeyCodes.Down) {
        if (!isOpen) {
          return setIsOpen(true);
        }
      }
      if (keyCode === KeyCodes.Up) {
        setHighlightedIndex(prev => {
          const next = prev === null ? filteredItems.length - 1 : prev - 1;
          if (next < 0) return filteredItems.length - 1;
          return next;
        });
        event?.preventDefault();
      } else if (keyCode === KeyCodes.Down) {
        setHighlightedIndex(prev => {
          const next = prev === null ? 0 : prev + 1;
          if (next > filteredItems.length - 1) return 0;
          return next;
        });
        event?.preventDefault();
      } else {
        setHighlightedIndex(null);
      }
      if (keyCode === KeyCodes.Escape) {
        closeMenu();
      }
      if (keyCode === KeyCodes.Enter) {
        if (highlightedIndex !== null) {
          handleClick(filteredItems[highlightedIndex]);
        }
        closeMenu();
      }
    },
    [filteredItems, highlightedIndex, isOpen]
  );

  useEffect(() => {
    const listener = (event: globalThis.MouseEvent) => {
      if (
        !menuRef ||
        !menuRef.current ||
        menuRef.current.contains(event.target as Node)
      ) {
        return;
      }
      closeMenu();
    };
    document.addEventListener("mouseup", listener);
    return () => {
      document.removeEventListener("mouseup", listener);
    };
  }, [menuRef]);

  const handleMouseMove = useCallback(
    index => {
      if (index === highlightedIndex) {
        return;
      }
      setHighlightedIndex(index);
    },
    [highlightedIndex]
  );

  const handleMouseDown = useCallback((event: React.MouseEvent<any>) => {
    event.preventDefault();
  }, []);

  const handleClick = useCallback((item: Item | string) => {
    setSelectedItem(item);
    setInputValue(itemToString(item));
  }, []);

  const handleSetInputValue = useCallback((value: string) => {
    setInputValue(value);
    isDirty.current = true;
  }, []);

  useEffect(() => {
    if (selectedItem === initialSelectedItem) {
      return;
    }
    onChange?.(selectedItem);
  }, [selectedItem]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    setIsOpen(true);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleFocus = useCallback(() => {
    openMenu();
  }, []);

  const handleBlur = useCallback(() => {
    closeMenu();
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    // isDirty.current && openMenu()
  }, [inputValue]);

  return {
    highlightedIndex,
    onKeyDown: handleKeyDown,
    inputValue,
    setInputValue: handleSetInputValue,
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    menuRef,
    inputRef,
    selectedItem,
    setSelectedItem: handleSetSelectedItem,
    items: filteredItems,
    onMouseMove: handleMouseMove,
    onMouseDown: handleMouseDown,
    onClick: handleClick,
    onFocus: handleFocus,
    onBlur: handleBlur
  };
};

export default useShiftDown;
