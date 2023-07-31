import { ShapeConfig } from 'konva/lib/Shape';
import { KonvaEventObject } from 'konva/lib/Node';

export type OrnateShapeType =
  | 'RECT'
  | 'CIRCLE'
  | 'LINE'
  | 'TEXT'
  | 'GROUP'
  | 'FILE_URL'
  | 'IMAGE';

export type OrnateShapeConfig = ShapeConfig & {
  id: string;
  type?: OrnateShapeType;

  // ID of Group to be attached to
  groupId?: string;

  // If selected by the Select tool, select the whole group, not just the individual node
  forceSelectGroup?: boolean;

  // When saving, does not get included as part of the serialization
  preventSerialize?: boolean;

  // Unselectable by the Select Tool
  unselectable?: boolean;

  // Source of the drawing
  source?: string;

  metadata?: Record<string, string>;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
};
