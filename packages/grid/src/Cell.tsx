import React, { memo } from "react";
import { RendererProps } from "./Grid";
import { Group, Rect, Text } from "react-konva";
import { KonvaEventObject } from "konva/types/Node";
import { isNull } from "./helpers";

export interface CellProps extends RendererProps {
  value?: string;
  textColor?: string;
  padding?: number;
  fontWeight?: string;
  fontStyle?: string;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
}

/**
 * Default cell component
 * @param props
 */
const Cell: React.FC<CellProps> = memo(props => {
  const {
    x,
    y,
    width,
    height,
    value,
    fill = "white",
    strokeWidth = 1,
    stroke = "#d9d9d9",
    align = "left",
    verticalAlign = "middle",
    textColor = "#333",
    padding = 5,
    fontFamily = "Arial",
    fontSize = 12,
    children,
    wrap = "none",
    fontWeight = "normal",
    fontStyle = "normal",
    textDecoration,
    alpha = 1,
    globalCompositeOperation = "multiply",
    ...rest
  } = props;
  const fillEnabled = !!fill;
  const textStyle = `${fontWeight} ${fontStyle}`;
  return (
    <Group {...rest}>
      <Rect
        x={x}
        y={y}
        height={height}
        width={width}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        shadowForStrokeEnabled={false}
        strokeScaleEnabled={false}
        hitStrokeWidth={0}
        alpha={alpha}
        fillEnabled={fillEnabled}
      />
      {isNull(value) ? null : (
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
          text={value}
          fill={textColor}
          verticalAlign={verticalAlign}
          align={align}
          fontFamily={fontFamily}
          fontStyle={textStyle}
          textDecoration={textDecoration}
          padding={padding}
          wrap={wrap}
          fontSize={fontSize}
          hitStrokeWidth={0}
        />
      )}
      {children}
    </Group>
  );
});

/**
 * Default CellRenderer
 * @param props
 */
const CellRenderer = (props: RendererProps) => {
  return <Cell {...props} />;
};

export default CellRenderer;
export { CellRenderer, Cell };
