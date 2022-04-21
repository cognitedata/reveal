import { EdgePoint } from '..';
import { LineSegment } from '../PathSegment';
import { Point } from '../Point';

const precision = 5;

describe('LineSegment', () => {
  test('angle', async () => {
    const lineSegmentRight = new LineSegment(new Point(0, 0), new Point(10, 0));
    const lineSegmentUp = new LineSegment(new Point(0, 0), new Point(0, 10));
    const lineSegmentLeft = new LineSegment(new Point(0, 0), new Point(-10, 0));
    const lineSegmentLeftDown = new LineSegment(
      new Point(0, 0),
      new Point(-10, -0.0000001)
    );
    const lineSegmentDown = new LineSegment(new Point(0, 0), new Point(0, -10));

    expect(lineSegmentRight.angle).toBeCloseTo(0, precision);
    expect(lineSegmentUp.angle).toBeCloseTo(90, precision);
    expect(lineSegmentLeft.angle).toBeCloseTo(180, precision);
    expect(lineSegmentLeftDown.angle).toBeCloseTo(180, precision);
    expect(lineSegmentDown.angle).toBeCloseTo(270, precision);
  });

  test('getIntersection', async () => {
    const lineSegment1 = new LineSegment(new Point(-10, 0), new Point(10, 0));
    const lineSegment2 = new LineSegment(new Point(0, -10), new Point(0, 10));
    const lineSegment3 = new LineSegment(new Point(5, 0), new Point(5, 10));

    const intersectionData12 = lineSegment1.getIntersection(lineSegment2)!;
    expect(intersectionData12).not.toBeUndefined();
    expect(intersectionData12.intersection.x).toBeCloseTo(0, precision);
    expect(intersectionData12.intersection.y).toBeCloseTo(0, precision);
    expect(intersectionData12.thisPercentAlongPath).toBeCloseTo(0.5, precision);
    expect(intersectionData12.otherPercentAlongPath).toBeCloseTo(
      0.5,
      precision
    );

    const intersectionData13 = lineSegment1.getIntersection(lineSegment3)!;
    expect(intersectionData13).not.toBeUndefined();
    expect(intersectionData13.intersection.x).toBeCloseTo(5, precision);
    expect(intersectionData13.intersection.y).toBeCloseTo(0, precision);
    expect(intersectionData13.thisPercentAlongPath).toBeCloseTo(
      0.75,
      precision
    );
    expect(intersectionData13.otherPercentAlongPath).toBeCloseTo(0, precision);

    const intersectionData23 = lineSegment2.getIntersection(lineSegment3);
    expect(intersectionData23).toBeUndefined();
  });

  test('getClosestPointOnSegment', async () => {
    const lineSegment = new LineSegment(new Point(0, 0), new Point(0, 10));

    const point1 = new Point(1, 0);
    const closestPoint1 = lineSegment.getClosestPointOnSegment(point1);
    expect(closestPoint1.pointOnSegment.x).toBeCloseTo(0, precision);
    expect(closestPoint1.pointOnSegment.y).toBeCloseTo(0, precision);
    expect(closestPoint1.percentAlongPath).toBeCloseTo(0, precision);
    expect(closestPoint1.distance).toBeCloseTo(1, precision);

    const point2 = new Point(-5, 5);
    const closestPoint2 = lineSegment.getClosestPointOnSegment(point2);
    expect(closestPoint2.pointOnSegment.x).toBeCloseTo(0, precision);
    expect(closestPoint2.pointOnSegment.y).toBeCloseTo(5, precision);
    expect(closestPoint2.percentAlongPath).toBeCloseTo(0.5, precision);
    expect(closestPoint2.distance).toBeCloseTo(5, precision);

    const point3 = new Point(0, 20);
    const closestPoint3 = lineSegment.getClosestPointOnSegment(point3);
    expect(closestPoint3.pointOnSegment.x).toBeCloseTo(0, precision);
    expect(closestPoint3.pointOnSegment.y).toBeCloseTo(10, precision);
    expect(closestPoint3.percentAlongPath).toBeCloseTo(1, precision);
    expect(closestPoint3.distance).toBeCloseTo(10, precision);
  });

  test('getPointOnSegment', async () => {
    const lineSegment = new LineSegment(new Point(0, 0), new Point(10, 10));

    const point1 = lineSegment.getPointOnSegment(0);
    expect(point1.x).toBeCloseTo(0, precision);
    expect(point1.y).toBeCloseTo(0, precision);

    const point2 = lineSegment.getPointOnSegment(1);
    expect(point2.x).toBeCloseTo(10, precision);
    expect(point2.y).toBeCloseTo(10, precision);

    const point3 = lineSegment.getPointOnSegment(0.5);
    expect(point3.x).toBeCloseTo(5, precision);
    expect(point3.y).toBeCloseTo(5, precision);

    const point4 = lineSegment.getPointOnSegment(2);
    expect(point4.x).toBeCloseTo(20, precision);
    expect(point4.y).toBeCloseTo(20, precision);
  });

  test('getClosestPointsOnSegments parallel after each other', async () => {
    const lineSegment1 = new LineSegment(new Point(20, 0), new Point(30, 0));
    const lineSegment2 = new LineSegment(new Point(0, 0), new Point(10, 0));

    const {
      thisPoint,
      thisPercentAlongPath,
      otherPoint,
      otherPercentAlongPath,
      distance,
    } = lineSegment1.getClosestPointsOnSegments(lineSegment2);
    expect(thisPoint.x).toBeCloseTo(20, precision);
    expect(thisPoint.y).toBeCloseTo(0, precision);
    expect(thisPercentAlongPath).toBeCloseTo(0, precision);
    expect(otherPoint.x).toBeCloseTo(10, precision);
    expect(otherPoint.y).toBeCloseTo(0, precision);
    expect(otherPercentAlongPath).toBeCloseTo(1, precision);
    expect(distance).toBeCloseTo(10, precision);
  });

  test('getClosestPointsOnSegments 90 degree not touching', async () => {
    const lineSegment1 = new LineSegment(new Point(0, 0), new Point(0, 10));
    const lineSegment2 = new LineSegment(new Point(5, 15), new Point(15, 15));

    const {
      thisPoint,
      thisPercentAlongPath,
      otherPoint,
      otherPercentAlongPath,
      distance,
    } = lineSegment1.getClosestPointsOnSegments(lineSegment2);
    expect(thisPoint.x).toBeCloseTo(0, precision);
    expect(thisPoint.y).toBeCloseTo(10, precision);
    expect(thisPercentAlongPath).toBeCloseTo(1, precision);
    expect(otherPoint.x).toBeCloseTo(5, precision);
    expect(otherPoint.y).toBeCloseTo(15, precision);
    expect(otherPercentAlongPath).toBeCloseTo(0, precision);
    expect(distance).toBeCloseTo(Math.sqrt(5 * 5 + 5 * 5), precision);
  });

  test('getClosestPointsOnSegments intersecting', async () => {
    const lineSegment1 = new LineSegment(new Point(0, 0), new Point(10, 0));
    const lineSegment2 = new LineSegment(new Point(2, -5), new Point(2, 5));

    const {
      thisPoint,
      thisPercentAlongPath,
      otherPoint,
      otherPercentAlongPath,
      distance,
    } = lineSegment1.getClosestPointsOnSegments(lineSegment2);
    expect(thisPoint.distance(otherPoint)).toBeCloseTo(0, precision);
    expect(thisPercentAlongPath).toBeCloseTo(0.2, precision);
    expect(otherPercentAlongPath).toBeCloseTo(0.5, precision);
    expect(distance).toBeCloseTo(0, precision);
  });

  test('distanceWithLineJump', async () => {
    const lineSegment1 = new LineSegment(new Point(0, 0), new Point(10, 0));
    const lineSegment2 = new LineSegment(new Point(15, 0), new Point(20, 0));
    const lineSegment3 = new LineSegment(new Point(5, 0), new Point(5, 10));

    const distanceWithLineJump12 =
      lineSegment1.distanceWithLineJump(lineSegment2);
    expect(distanceWithLineJump12.isLineJump).toBeTruthy();
    expect(distanceWithLineJump12.distance).toBeCloseTo(5);
    expect(distanceWithLineJump12.thisClosestPoint).toBe(EdgePoint.Stop);
    expect(distanceWithLineJump12.otherClosestPoint).toBe(EdgePoint.Start);

    const distanceWithLineJump13 =
      lineSegment1.distanceWithLineJump(lineSegment3);
    expect(distanceWithLineJump13.isLineJump).toBeFalsy();
    expect(distanceWithLineJump13.distance).toBeCloseTo(0);
    expect(distanceWithLineJump13.thisClosestPoint).toBe(EdgePoint.Other);
    expect(distanceWithLineJump13.otherClosestPoint).toBe(EdgePoint.Start);

    const distanceWithLineJump21 =
      lineSegment2.distanceWithLineJump(lineSegment1);
    expect(distanceWithLineJump21.isLineJump).toBeTruthy();
    expect(distanceWithLineJump21.distance).toBeCloseTo(5);
    expect(distanceWithLineJump21.thisClosestPoint).toBe(EdgePoint.Start);
    expect(distanceWithLineJump21.otherClosestPoint).toBe(EdgePoint.Stop);
  });
});
