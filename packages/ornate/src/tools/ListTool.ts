import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Shape } from 'konva/lib/Shape';
import { ICogniteOrnateTool, Marker } from 'types';
import noop from 'lodash/noop';
import { v4 as uuid } from 'uuid';

import { CogniteOrnate } from '../cognite-ornate';

import { Tool } from './Tool';

const SQUARE_WIDTH = 32;
const SQUARE_HEIGHT = 32;

export class ListTool extends Tool implements ICogniteOrnateTool {
  cursor = 'default';
  listDrawingLayer = new Konva.Layer({
    name: 'listDrawingLayer',
  });
  markers: Marker[] = [];
  onMarkersChange: (nextMarkers: Marker[]) => void = noop;
  numberGroups: Konva.Group[] = [];

  constructor(ornateInstance: CogniteOrnate) {
    super(ornateInstance);
    ornateInstance.stage.add(this.listDrawingLayer);
  }

  reset = () => {
    this.numberGroups.forEach((g) => {
      g.destroy();
    });
    this.markers.forEach((marker) => {
      if (marker.shape?.attrs?.originalAttrs) {
        marker.shape.setAttrs(marker.shape.attrs.originalAttrs);
      }
    });
    this.markers = [];
    this.numberGroups = [];
  };

  renderMarkers = (markers: Marker[]) => {
    this.reset();
    markers.forEach(this.addMarker);
  };

  addMarker = (marker: Marker) => {
    const { x, y } = marker.position;
    const numberGroup = new Konva.Group({
      id: uuid(),
      name: 'marker',
    });
    const number = String(marker.order);
    const containerRect = new Konva.Rect({
      x: x - SQUARE_WIDTH,
      y: y - SQUARE_HEIGHT,
      width: SQUARE_WIDTH + (number.length - 1) * 8,
      height: SQUARE_HEIGHT,
      stroke: 'rgba(74, 103, 251, 0.8)',
      strokeWidth: 4,
      fill: 'white',
      attachedToGroup: numberGroup.id(),
    });
    const text = new Konva.Text({
      text: number,
      fontSize: 28,
      fontStyle: 'bold',
      align: 'center',
      fill: 'rgba(74, 103, 251, 0.8)',
      x: x - SQUARE_WIDTH / 2 - 8,
      y: y - SQUARE_HEIGHT / 2 - 12,
      attachedToGroup: numberGroup.id(),
    });

    marker.shape.setAttrs({
      ...marker.shape.attrs,
      inList: true,
    });

    if (marker.styleOverrides) {
      // Ensure if style was undefined before, that this is known.
      const emptyStyleKeys = Object.keys(marker.styleOverrides).reduce(
        (acc, key) => ({
          ...acc,
          [key]: undefined,
        }),
        {}
      );
      const originalAttrs = {
        ...emptyStyleKeys,
        ...(marker.shape.attrs.originalAttrs || marker.shape.getAttrs()),
      };
      marker.shape.setAttrs({
        ...originalAttrs,
        ...marker.styleOverrides,
        originalAttrs,
      });
    } else if (marker.shape.attrs.originalAttrs) {
      marker.shape.setAttrs(marker.shape.attrs.originalAttrs);
    }
    numberGroup.add(containerRect, text);

    if (marker.shape.attrs?.inGroup) {
      const group = this.ornateInstance.stage.findOne(
        `#${marker.shape.attrs?.inGroup}`
      ) as Konva.Group;
      if (group) {
        group.add(numberGroup);
      }
    } else {
      this.listDrawingLayer.add(numberGroup);
    }

    this.markers.push(marker);
    this.numberGroups.push(numberGroup);

    if (this.onMarkersChange) {
      this.onMarkersChange(this.markers);
    }
  };

  onAnnotationClick = (_: KonvaEventObject<MouseEvent>, shape: Shape) => {
    this.addMarker({
      order: this.markers.length + 1,
      position: { x: shape.x(), y: shape.y() },
      groupId: shape.attrs.inGroup,
      shape,
      shapeId: shape.id(),
      metadata: {},
    });
  };

  onMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target.attrs.unselectable) {
      return;
    }
    const allowedShapes = ['rect', 'circle', 'text'];
    if (allowedShapes.includes(e.target.attrs.type)) {
      this.addMarker({
        order: this.markers.length + 1,
        position: { x: e.target.x(), y: e.target.y() },
        groupId: e.target.attrs.inGroup,
        shape: e.target as Shape,
        shapeId: e.target.id(),
        metadata: {},
      });
    }
  };
}
