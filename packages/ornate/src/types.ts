import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Shape, ShapeConfig } from 'konva/lib/Shape';

import { CogniteOrnate } from './cognite-ornate';

export type OrnatePDFDocument = {
  image: HTMLImageElement;
  annotations: OrnateAnnotation[];
  scale: number;
  group: Konva.Group;
  kImage: Konva.Image;
  metadata?: Record<string, string>;
};
export type OrnateAnnotation = {
  id: string;
  type: 'pct' | 'px';
  width: number;
  height: number;
  x: number;
  y: number;
  onClick?: (data: OrnateAnnotationInstance) => void;
  stroke?: string;
  strokeWidth?: number;
  metadata?: Record<string, string>;
  fill?: string;
  cornerRadius?: number;
};
export type OrnateAnnotationInstance = {
  annotation: OrnateAnnotation;
  instance: Konva.Rect;
  document: OrnatePDFDocument;
};

export type Drawing = {
  id?: string;
  type:
    | 'rect'
    | 'line'
    | 'text'
    | 'circle'
    | 'comment'
    | 'stamp'
    | 'squiggle'
    | 'path'
    | 'circleMarker'
    | 'arrow';
  attrs: any;
  groupId?: string;
  onClick?: (event: KonvaEventObject<MouseEvent>) => void;
};

export type OrnateJsonDocument = {
  metadata: Record<string, string>;
  x: number;
  y: number;
  drawings: Drawing[];
};

export type OrnateConnectedDocumentLine = {
  groupId: string;
  x: number;
  y: number;
  metadata: Record<string, string>;
};

export type OrnateJSON = {
  documents: OrnateJsonDocument[];
  connectedLines: {
    nodeA: OrnateConnectedDocumentLine;
    nodeB: OrnateConnectedDocumentLine;
  }[];
};

export type ShapeType = 'rect' | 'text' | 'circle' | 'line';

export type ToolType =
  | ShapeType
  | 'move'
  | 'default'
  | 'comment'
  | 'list'
  | 'stamp'
  | 'squiggle';

export type ShapeSettings = {
  [key in ToolType]?: ShapeConfig;
};

export type Marker = {
  order: number;
  position: {
    x: number;
    y: number;
  };
  groupId: string;
  shape: Shape;
  shapeId: string;
  metadata: Record<string, string | undefined>;
  styleOverrides?: ShapeConfig;
};

export interface ICogniteOrnateTool {
  /** Mouse cursor that will be used for this tool */
  cursor: string;
  /** The CogniteOrnate instance passed in the constructor */
  ornateInstance: CogniteOrnate;
  /** Called when the tool is created */
  onInit: () => void;
  /** Called when the tool is being destroyed */
  onDestroy: () => void;
  /** Mouse down, use to start some activity */
  onMouseDown: (e: KonvaEventObject<MouseEvent>) => void;
  /** Mouse move, use to update the shape */
  onMouseMove: (e: KonvaEventObject<MouseEvent>) => void;
  /** Mouse up, use to stop activity */
  onMouseUp: (e: KonvaEventObject<MouseEvent>) => void;
  /** Called when a shape of any kind is clicked */
  onAnnotationClick: (e: KonvaEventObject<MouseEvent>, shape: Shape) => void;
  /** A preview displayed on the mouse cursor */
  preview?: Konva.Node;
}
