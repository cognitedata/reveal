import Konva from 'konva';

import { OrnateShapeObject } from '../ornate';

import {
  Circle,
  Line,
  Rect,
  Text,
  Shape,
  FileURL,
  OrnateFileURLConfig,
} from '.';
import { Image, OrnateImageConfig } from './image';

export const toKonva = (
  obj: OrnateShapeObject,
  shapeSpecifics?: {
    fileUrl?: Partial<OrnateFileURLConfig>;
  }
): Konva.Shape | Konva.Group => {
  const { type } = obj.attrs;
  switch (type) {
    case 'CIRCLE':
      return new Circle(obj.attrs).shape;

    case 'LINE':
      return new Line(obj.attrs).shape;

    case 'RECT':
      return new Rect(obj.attrs).shape;

    case 'TEXT':
      return new Text(obj.attrs).shape;

    case 'IMAGE':
      return new Image(obj.attrs as OrnateImageConfig).shape;

    case 'FILE_URL':
      if (!shapeSpecifics?.fileUrl)
        throw new Error('File URL shape requirements not met, cannot reload');
      return new FileURL({
        ...(obj.attrs as OrnateFileURLConfig),
        ...shapeSpecifics.fileUrl,
      }).shape;

    case 'GROUP': {
      const group = new Konva.Group(obj.attrs);
      group.add(...obj.children.map((c) => toKonva(c, shapeSpecifics)));
      return group;
    }
    default:
      // eslint-disable-next-line no-console
      console.warn('Invalid shape with no type:', obj);
      return new Shape(obj.attrs).shape;
  }
};
