import { Circle, Rect } from '../shapes';

export const mockShapeCollection = [
  new Circle({
    id: 'circle',
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    fill: 'red',
  }),
  new Rect({
    id: 'rect',
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    fill: 'blue',
  }),
];
