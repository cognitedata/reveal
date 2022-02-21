import { BoundingBox } from '../BoundingBox';
import { Point } from '../Point';

describe('BoundingBox', () => {
  test('encloses', async () => {
    const boundingBox = new BoundingBox(0, 0, 2, 2);

    const pointInside = new Point(1, 1);
    expect(boundingBox.encloses(pointInside)).toBeTruthy();

    const pointOutside = new Point(3, 3);
    expect(boundingBox.encloses(pointOutside)).toBeFalsy();

    const pointOnBorder = new Point(2, 2);
    expect(boundingBox.encloses(pointOnBorder, true)).toBeTruthy();
    expect(boundingBox.encloses(pointOnBorder, false)).toBeFalsy();
  });

  test('normalize', async () => {
    const boundingBox = new BoundingBox(150, 150, 10, 10);

    const normalizedBoundingBox = boundingBox.normalize({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
    });
    expect(normalizedBoundingBox.x).toBeCloseTo(0.5);
    expect(normalizedBoundingBox.y).toBeCloseTo(0.5);
    expect(normalizedBoundingBox.width).toBeCloseTo(0.1);
    expect(normalizedBoundingBox.height).toBeCloseTo(0.1);
  });

  test('midPoint', async () => {
    const midPoint = new BoundingBox(0, 10, 10, 10).midPoint();

    expect(midPoint.x).toBeCloseTo(5);
    expect(midPoint.y).toBeCloseTo(15);
  });
});
