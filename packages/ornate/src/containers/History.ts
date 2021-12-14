import { CogniteOrnate } from 'cognite-ornate';
import Konva from 'konva';
import { Node, NodeConfig } from 'konva/lib/Node';
import { Shape, ShapeConfig } from 'konva/lib/Shape';

export type UpdateKeyType = 'strokeWidth' | 'stroke' | 'fill' | 'fontSize';

type ExtendedHistoryItem = {
  action: string;
  update: Partial<ShapeConfig>;
};

/**
 * Class to be used to add shapes which can be undone.
 */
export class OrnateHistory {
  private undoHistory: ExtendedHistoryItem[];

  constructor(undoHistory: ExtendedHistoryItem[]) {
    this.undoHistory = undoHistory;
  }

  /**
   * Function which keeps track of the shape creation so it can be undone
   */
  addShape = (shape: Shape<ShapeConfig>) => {
    const shapeWithAction = {
      action: 'create',
      update: shape.attrs,
    } as ExtendedHistoryItem;
    this.undoHistory.push(shapeWithAction);
  };

  /**
   * Function which keeps track of the destroyed shape so it can be undone
   */
  destroyShape = (selectedShape: Node<NodeConfig>) => {
    const shapeWithAction = {
      action: 'delete',
      update: selectedShape.attrs,
    } as ExtendedHistoryItem;
    this.undoHistory.push(shapeWithAction);
  };

  /**
   * Function which keeps track of the shape update so it can be undone
   */
  updateShape = (
    selectedShape: Node<NodeConfig>,
    updatedKey: UpdateKeyType
  ) => {
    const shapeWithAction = {
      action: 'update',
      update: {
        [updatedKey]: selectedShape.attrs[updatedKey],
        id: selectedShape.attrs?.id,
        attachedToGroup: selectedShape.attrs?.attachedToGroup,
        inGroup: selectedShape.attrs?.inGroup,
      },
    } as ExtendedHistoryItem;
    this.undoHistory.push(shapeWithAction);
  };

  /**
   * Function which creates the shape, used from the undo array. Should not be used outside the History.tsx file.
   */
  createShape = (attrs: any) => {
    if (!attrs) return undefined;
    if (attrs.type === 'rect') {
      return new Konva.Rect(attrs);
    }
    if (attrs.type === 'circle') {
      return new Konva.Circle(attrs);
    }
    if (attrs.type === 'line') {
      return new Konva.Line(attrs);
    }
    return undefined;
  };

  /**
   * Function which is responsible for undoing the changes user made.
   */
  undoChanges = (ornateInstance: CogniteOrnate) => {
    if (this.undoHistory?.length === 0) return;
    const latestChange = this.undoHistory[this.undoHistory.length - 1];
    const groupName =
      latestChange.update?.attachedToGroup || latestChange.update?.inGroup;
    const group = ornateInstance.stage.findOne(`#${groupName}`) as Konva.Group;
    const layer: Konva.Layer | Konva.Group =
      group || ornateInstance.drawingLayer;
    if (latestChange && latestChange.action === 'create') {
      this.undoHistory.pop();
      const selectedNode = layer.findOne(`#${latestChange.update.id}`);
      if (selectedNode) {
        selectedNode.destroy();
      }
    }
    if (latestChange && latestChange.action === 'update') {
      this.undoHistory.pop();
      const selectedNode = layer.findOne(`#${latestChange.update.id}`);
      if (selectedNode) {
        const changedKey = Object.keys(latestChange.update)[0] as UpdateKeyType;
        selectedNode.setAttr(changedKey, latestChange.update[changedKey]);
      }
    }
    if (latestChange && latestChange.action === 'delete') {
      this.undoHistory.pop();
      const newShape = this.createShape(latestChange.update);
      if (newShape) {
        layer.add(newShape);
      }
    }
  };
}
