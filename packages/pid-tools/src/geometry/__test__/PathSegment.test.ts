import { LineSegment } from '../PathSegment';
import { Point } from '../Point';

const decimalPrecision = 5;

describe('LineSegment', () => {
  test('isSimilarWithTranslationAndScale', () => {
    const lineSegment1 = new LineSegment(new Point(0, 0), new Point(40, 0));
    const lineSegment2 = new LineSegment(new Point(10, 0), new Point(50, 0));
    const lineSegment3 = new LineSegment(new Point(50, 0), new Point(10, 0));

    expect(
      lineSegment1.getTranslationAndScaleDistance(
        lineSegment1.midPoint,
        lineSegment1.length,
        lineSegment2,
        lineSegment2.midPoint,
        lineSegment2.length
      )
    ).toBe(0);

    expect(
      lineSegment1.getTranslationAndScaleDistance(
        lineSegment1.midPoint,
        lineSegment1.length,
        lineSegment3,
        lineSegment3.midPoint,
        lineSegment3.length
      )
    ).toBe(0);
  });

  test('getIntersection', () => {
    const lineSegment1 = new LineSegment(new Point(-10, 0), new Point(10, 0));
    const lineSegment2 = new LineSegment(new Point(0, -10), new Point(0, 10));
    const lineSegment3 = new LineSegment(new Point(5, 0), new Point(5, 10));

    const intersection12 = lineSegment1.getIntersection(lineSegment2)!;
    expect(intersection12.x).toBeCloseTo(0, decimalPrecision);
    expect(intersection12.y).toBeCloseTo(0, decimalPrecision);

    const intersection13 = lineSegment1.getIntersection(lineSegment3)!;
    expect(intersection13.x).toBeCloseTo(5, decimalPrecision);
    expect(intersection13.y).toBeCloseTo(0, decimalPrecision);

    const intersection23 = lineSegment1.getIntersection(lineSegment3)!;
    expect(intersection23.x).toBeCloseTo(5, decimalPrecision);
    expect(intersection23.y).toBeCloseTo(0, decimalPrecision);
  });
});
