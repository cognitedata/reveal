import { KonvaEventObject } from 'konva/lib/Node';

import { CogniteOrnate } from '../ornate';

export type ToolType =
  | 'HAND'
  | 'SELECT'
  | 'CIRCLE'
  | 'RECT'
  | 'LINE'
  | 'PATH'
  | 'TEXT'
  | 'STAMP'
  | 'LIST';

export type ToolNodeStyle = {
  fill?: string;
  stroke?: string;
  fontSize?: string;
  strokeWidth?: number;
};

export interface Tool {
  ornate: CogniteOrnate;
  name: ToolType;
  cursor?: string;
  style?: ToolNodeStyle;
  onMouseDown?(_: KonvaEventObject<MouseEvent>): void;
  onMouseMove?(_: KonvaEventObject<MouseEvent>): void;
  onMouseUp?(_: KonvaEventObject<MouseEvent>): void;
  onMouseOver?(_: KonvaEventObject<MouseEvent>): void;
  onDestroy?(): void;
}
