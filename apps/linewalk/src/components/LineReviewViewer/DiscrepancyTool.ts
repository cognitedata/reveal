/* eslint-disable no-unsafe-optional-chaining */
import { ICogniteOrnateTool, Tool } from '@cognite/ornate';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuid } from 'uuid';

export enum EventType {
  ON_CREATE_END = 'onCreateEnd',
}

type EventListenerMap = {
  [EventType.ON_CREATE_END]: (nodeId: string, groupId: string) => void;
};

const getVisualPropertiesByStatus = (status: string) => {
  if (status === 'approved') {
    return {
      fill: 'rgba(213, 26, 70, 0.15)',
      stroke: '#D51A46',
    };
  }

  return {
    fill: 'rgba(255, 187, 0, 0.12)',
    stroke: '#D67F05',
  };
};

export default class DiscrepancyTool
  extends Tool
  implements ICogniteOrnateTool
{
  private eventListenersByEventType = new Map<
    EventType,
    EventListenerMap[EventType][]
  >();

  cursor = 'crosshair';
  newRect: Konva.Rect | null = null;
  group: Konva.Group | null = null;
  isToolUsingShapeSettings = true;

  static getDiscrepancyNode = ({
    id,
    x,
    y,
    width,
    height,
    groupId,
    status,
  }: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    groupId: string;
    status: string;
  }) =>
    new Konva.Rect({
      id,
      x,
      y,
      width,
      height,
      userGenerated: true,
      type: 'rect',
      name: 'drawing',
      strokeWidth: 2,
      dash: [2, 2],
      unselectable: true,
      inGroup: groupId,
      ...getVisualPropertiesByStatus(status),
    });

  addEventListener = (
    eventType: EventType,
    listenerFn: EventListenerMap[EventType]
  ) => {
    const eventListeners = this.eventListenersByEventType.get(eventType) ?? [];
    this.eventListenersByEventType.set(eventType, [
      ...eventListeners,
      listenerFn,
    ]);
  };

  removeEventListener = (
    eventType: EventType,
    listenerFn: EventListenerMap[EventType]
  ) => {
    const eventListeners = this.eventListenersByEventType.get(eventType);
    if (eventListeners === undefined) {
      return;
    }

    this.eventListenersByEventType.set(
      eventType,
      eventListeners.filter(
        (existingListenerFn) => existingListenerFn !== listenerFn
      )
    );
  };

  emit = (
    eventType: EventType,
    ...args: Parameters<EventListenerMap[EventType]>
  ) => {
    const eventListeners = this.eventListenersByEventType.get(eventType);
    if (eventListeners === undefined) {
      return;
    }

    eventListeners.forEach((listener) => listener(...args));
  };

  getPosition = () => {
    let { x, y } = this.ornateInstance.getTranslatedPointerPosition();
    if (this.group) {
      x -= this.group.x();
      y -= this.group.y();
    }
    return {
      x,
      y,
    };
  };

  onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    this.ornateInstance.isDrawing = true;

    // If we're over an item with a group attachment, add it there instead.
    const groupName =
      e.target.attrs?.attachedToGroup || e.target.attrs?.inGroup;
    this.group = this.ornateInstance.stage.findOne(
      `#${groupName}`
    ) as Konva.Group;

    const translatedMousePosition = this.getPosition();
    const shapeId = uuid();

    this.newRect = DiscrepancyTool.getDiscrepancyNode({
      id: shapeId,
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
      width: 1,
      height: 1,
      groupId: groupName,
      status: 'pending',
    });

    this.ornateInstance.addShape(this.newRect);
  };

  onMouseMove = () => {
    const { baseLayer } = this.ornateInstance;
    if (!this.newRect) {
      return;
    }
    if (this.ornateInstance.isDrawing) {
      const translatedMousePosition = this.getPosition();

      this.newRect.width(translatedMousePosition.x - this.newRect.x());
      this.newRect.height(translatedMousePosition.y - this.newRect.y());

      baseLayer.draw();
    }
  };

  onMouseUp = () => {
    this.ornateInstance.isDrawing = false;

    if (this.newRect && this.group) {
      this.emit(EventType.ON_CREATE_END, this.newRect.id(), this.group?.id());
    }
  };
}
