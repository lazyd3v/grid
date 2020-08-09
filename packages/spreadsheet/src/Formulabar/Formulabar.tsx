import React, { memo, forwardRef } from "react";
import {
  InputGroup,
  InputLeftAddon,
  Input,
  useColorMode,
  useTheme
} from "@chakra-ui/core";
import { DARK_MODE_COLOR, FORMULABAR_LEFT_CORNER_WIDTH } from "./../constants";

interface FormulabarProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: string;
}

export type FormulaRef = {
  ref?: React.MutableRefObject<HTMLInputElement | null>;
};

const Formulabar: React.FC<FormulabarProps & FormulaRef> = memo(
  forwardRef((props, forwardedRef) => {
    const { value, onChange, onKeyDown, onFocus, onBlur } = props;
    const { colorMode } = useColorMode();
    const theme = useTheme();
    const isLightMode = colorMode === "light";
    const backgroundColor = isLightMode ? "white" : DARK_MODE_COLOR;
    const color = isLightMode ? DARK_MODE_COLOR : "white";
    const borderColor = isLightMode
      ? theme.colors.gray[300]
      : theme.colors.gray[600];
    const height = "24px";
    return (
      <InputGroup
        size="sm"
        borderTopWidth={1}
        borderTopStyle="solid"
        borderTopColor={borderColor}
        height={height}
      >
        <InputLeftAddon
          width={FORMULABAR_LEFT_CORNER_WIDTH}
          justifyContent="center"
          bg={backgroundColor}
          color={color}
          fontSize={12}
          fontStyle="italic"
          borderTopWidth={0}
          borderBottomWidth={0}
          size="sm"
          borderRadius={0}
          children="fx"
          height="auto"
          userSelect="none"
          borderLeftColor={borderColor}
        />
        <Input
          borderTopWidth={0}
          borderBottomWidth={0}
          size="sm"
          borderRadius={0}
          pl={2}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          color={color}
          focusBorderColor={borderColor}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          height={"100%"}
          lineHeight={1}
          fontSize={12}
          ref={forwardedRef}
          _focus={{
            boxShadow: "none"
          }}
        />
      </InputGroup>
    );
  })
);

export default Formulabar;
