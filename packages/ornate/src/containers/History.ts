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
  private redoHistory: ExtendedHistoryItem[];

  constructor(
    undoHistory: ExtendedHistoryItem[],
    redoHistory: ExtendedHistoryItem[]
  ) {
    this.undoHistory = undoHistory;
    this.redoHistory = redoHistory;
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
        id: selectedShape.attrs?.id,
        attachedToGroup: selectedShape.attrs?.attachedToGroup,
        inGroup: selectedShape.attrs?.inGroup,
        [updatedKey]: selectedShape.attrs[updatedKey],
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
    if (attrs.type === 'text') {
      return new Konva.Text(attrs);
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
    const layer: Konva.Layer | Konva.Group = group || ornateInstance.baseLayer;
    if (latestChange && latestChange.action === 'create') {
      this.undoHistory.pop();
      const newChange = {
        action: 'delete',
        update: latestChange.update,
      } as ExtendedHistoryItem;
      this.redoHistory.push(newChange);
      const selectedNode = layer.findOne(`#${latestChange.update.id}`);
      if (selectedNode) {
        selectedNode.destroy();
      }
    }
    if (latestChange && latestChange.action === 'update') {
      this.undoHistory.pop();
      const selectedNode = layer.findOne(`#${latestChange.update.id}`);
      const updateKeys = Object.keys(latestChange.update);
      const attributeKey = updateKeys[updateKeys.length - 1];
      const newChange = {
        action: 'update',
        update: {
          ...latestChange.update,
          [attributeKey]: selectedNode.attrs[attributeKey],
        },
      };
      this.redoHistory.push(newChange);
      if (selectedNode) {
        selectedNode.setAttr(attributeKey, latestChange.update[attributeKey]);
      }
    }
    if (latestChange && latestChange.action === 'delete') {
      this.undoHistory.pop();
      const newChange = {
        action: 'create',
        update: latestChange.update,
      } as ExtendedHistoryItem;
      this.redoHistory.push(newChange);
      const newShape = this.createShape(latestChange.update);
      if (newShape) {
        layer.add(newShape);
      }
    }
  };

  /**
   * Function which is responsible for redoing the changes user made.
   */
  redoChanges = (ornateInstance: CogniteOrnate) => {
    if (this.redoHistory?.length === 0) return;
    const latestChange = this.redoHistory[this.redoHistory.length - 1];
    const groupName =
      latestChange.update?.attachedToGroup || latestChange.update?.inGroup;
    const group = ornateInstance.stage.findOne(`#${groupName}`) as Konva.Group;
    const layer: Konva.Layer | Konva.Group = group || ornateInstance.baseLayer;
    if (latestChange && latestChange.action === 'create') {
      this.redoHistory.pop();
      const newChange = {
        action: 'delete',
        update: latestChange.update,
      } as ExtendedHistoryItem;
      this.undoHistory.push(newChange);
      const selectedNode = layer.findOne(`#${latestChange.update.id}`);
      if (selectedNode) {
        selectedNode.destroy();
      }
    }
    if (latestChange && latestChange.action === 'update') {
      this.redoHistory.pop();
      const selectedNode = layer.findOne(`#${latestChange.update.id}`);
      const updateKeys = Object.keys(latestChange.update);
      const attributeKey = updateKeys[updateKeys.length - 1];
      const newChange = {
        action: 'update',
        update: {
          ...latestChange.update,
          [attributeKey]: selectedNode.attrs[attributeKey],
        },
      };
      this.undoHistory.push(newChange);
      if (selectedNode) {
        selectedNode.setAttr(attributeKey, latestChange.update[attributeKey]);
      }
    }
    if (latestChange && latestChange.action === 'delete') {
      this.redoHistory.pop();
      const newChange = {
        action: 'create',
        update: latestChange.update,
      } as ExtendedHistoryItem;
      this.undoHistory.push(newChange);
      const newShape = this.createShape(latestChange.update);
      if (newShape) {
        layer.add(newShape);
      }
    }
  };
}
