import React, { useState, useCallback } from "react";
import { Group, Rect, Path } from "react-konva";
import { ShapeConfig } from "konva/types/Shape";
import { KonvaEventObject } from "konva/types/Node";
import { CellInterface } from "@rowsncolumns/grid";

export const FILTER_ICON_DIM = 16;

export interface FilterIconProps extends ShapeConfig {
  rowIndex: number;
  columnIndex: number;
  isActive: boolean;
  onClick?: (cell: CellInterface) => void;
}

const FILTER_PATH = "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z";
const FUNNEL_PATH =
  "M19 6h-14c-1.1 0-1.4.6-.6 1.4l4.2 4.2c.8.8 1.4 2.3 1.4 3.4v5l4-2v-3.5c0-.8.6-2.1 1.4-2.9l4.2-4.2c.8-.8.5-1.4-.6-1.4z";
const ICON_COLOR = "green";

/**
 * Filter icon
 * @param param0
 */
const FilterIcon: React.FC<FilterIconProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  rowIndex,
  columnIndex,
  onClick,
  isActive
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const padding = (height - FILTER_ICON_DIM) / 2;
  const posX = x + width - FILTER_ICON_DIM - 2; // - padding + 0.5;
  const posY = y + padding + 0.5;
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    onClick?.({ rowIndex, columnIndex });
  };
  return (
    <Group
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Rect
        x={posX}
        y={posY}
        width={FILTER_ICON_DIM}
        height={FILTER_ICON_DIM}
        fill={isHovered ? ICON_COLOR : "white"}
        cornerRadius={2}
      />
      <Path
        data={isActive ? FUNNEL_PATH : FILTER_PATH}
        x={posX + 1}
        y={posY + 1}
        fill={isHovered ? "white" : ICON_COLOR}
        scaleY={0.6}
        scaleX={0.6}
        listening={false}
      />
    </Group>
  );
};

export default FilterIcon;
