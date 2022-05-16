import { KonvaEventObject } from 'konva/lib/Node';

import { CogniteOrnate } from '../../ornate';
import { Tool, ToolType } from '..';

export type OrnateListToolItem = {
  order: number;
  shapeId: string;
  metadata?: Record<string, string>;
  text?: string;
  assetId?: number;
  status?: string;
};

export class ListTool implements Tool {
  name: ToolType = 'LIST';
  ornate: CogniteOrnate;
  listItems: OrnateListToolItem[] = [];
  onListUpdate?: (nextListItems: OrnateListToolItem[]) => void;

  constructor(instance: CogniteOrnate) {
    this.ornate = instance;
  }

  setListUpdateFunc = (func: (nextListItems: OrnateListToolItem[]) => void) => {
    this.onListUpdate = func;
  };
  setListItems = (listItems: OrnateListToolItem[]) => {
    this.listItems = listItems;
  };

  onListAdd = (shapeId: string) => {
    this.listItems.push({
      order: this.listItems.length + 1,
      shapeId,
    });
    if (this.onListUpdate) {
      this.onListUpdate(this.listItems);
    }
  };

  onMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    const allowedShapes = ['RECT', 'CIRCLE', 'TEXT', 'FILE_ANNOTATION'];
    if (allowedShapes.includes(e.target.attrs.type)) {
      this.onListAdd(e.target.id());

      this.ornate.emitSaveEvent();
    }
  };
}
