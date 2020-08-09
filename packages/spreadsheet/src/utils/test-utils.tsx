import React from "react";
import { render } from "@testing-library/react";
import { Stage, Layer } from "react-konva";

const KonvaWrapper = ({ children }) => {
  return (
    <Stage>
      <Layer>{children}</Layer>
    </Stage>
  );
};

const konvaRenderer = ui => render(ui, { wrapper: KonvaWrapper });

export * from "@testing-library/react";
export { konvaRenderer };
