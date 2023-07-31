import { DataElement, Detection } from '.';

export type OrnateTag = {
  id: string;
  detection: Detection;
  dataElement: DataElement;
  isActive?: boolean;
};

export enum WorkspaceTool {
  MOVE = 'move',
  RECTANGLE = 'rectangle',
}
