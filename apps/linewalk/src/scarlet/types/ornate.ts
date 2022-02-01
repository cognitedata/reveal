import { DataElement, Detection } from '.';

export type OrnateTag = {
  id: string;
  detection: Detection;
  dataElement: DataElement;
};

export enum WorkspaceTool {
  MOVE = 'move',
  RECTANGLE = 'rectangle',
}
