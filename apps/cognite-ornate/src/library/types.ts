import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';

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
};
export type OrnateAnnotationInstance = {
  annotation: OrnateAnnotation;
  instance: Konva.Rect;
  document: OrnatePDFDocument;
};

export type Drawing = {
  type: 'rect' | 'line' | 'text' | 'circle';
  attrs: any;
  groupId?: string;
};

export type OrnateJSON = {
  documents: {
    metadata: Record<string, string>;
    x: number;
    y: number;
    drawings: Drawing[];
  }[];
};

export type ToolType = 'move' | 'line' | 'rect' | 'text' | 'default' | 'circle';

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
}
