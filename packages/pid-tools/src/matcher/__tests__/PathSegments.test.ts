import { LineSegment, Point } from '../PathSegments';

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
});
