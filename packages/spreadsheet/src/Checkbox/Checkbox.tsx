import React, { useCallback, useState } from "react";
import { ShapeConfig } from "konva/types/Shape";
import { Group, Rect, Path } from "react-konva";
import { CellInterface } from "@rowsncolumns/grid";

export const CHECKBOX_ICON_DIM = 16;
const ICON_COLOR = "#808080";
export const CHECKBOX_ICON =
  "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z";
export const CHECKBOX_CHECKED_ICON =
  "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";
export interface CheckboxProps extends ShapeConfig {
  checked?: boolean;
  rowIndex: number;
  columnIndex: number;
  onChange?: (cell: CellInterface, checked: boolean) => void;
}
const padding = 1.5;

const Checkbox: React.FC<CheckboxProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  checked = false,
  onChange,
  rowIndex,
  columnIndex
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const dim = CHECKBOX_ICON_DIM;
  const posX = x + width / 2 - dim / 2 + 0.5 - padding;
  const posY = y + height / 2 - dim / 2 + 0.5 - padding;
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  const handleClick = useCallback(() => {
    onChange?.({ rowIndex, columnIndex }, !checked);
  }, [checked, rowIndex, columnIndex]);
  return (
    <Group
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Rect x={posX} y={posY} width={dim} height={dim} cornerRadius={2} />
      <Path
        data={checked ? CHECKBOX_CHECKED_ICON : CHECKBOX_ICON}
        x={posX}
        y={posY}
        scaleY={0.8}
        scaleX={0.8}
        listening={false}
        fill={isHovered ? "#444" : ICON_COLOR}
      />
    </Group>
  );
};

export default Checkbox;
