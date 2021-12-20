import { ShapeSettings, CogniteOrnate, ToolType } from '@cognite/ornate';
import Color from 'color';
import { MutableRefObject } from 'react';

export type PredefinedStyle = {
  label: string;
  value: Color;
};

export type OrnateContextType = {
  ornateViewer: MutableRefObject<CogniteOrnate | undefined>;
  shapeSettings: ShapeSettings;
  setShapeSettings: (shapeSettings: ShapeSettings) => void;
  onShapeSettingsChange: (shapeSettingsChange: Partial<ShapeSettings>) => void;
  initOrnate: (instance: CogniteOrnate) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  predefinedStyle: PredefinedStyle;
  setPredefinedStyle: (style: PredefinedStyle) => void;
};
