export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  isSimilar(point: Point): boolean {
    return Math.abs(this.x - point.x) < 2 && Math.abs(this.y - point.y) < 2;
  }

  isSimilarNormalized(point: Point): boolean {
    return (
      Math.abs(this.x - point.x) < 0.01 && Math.abs(this.y - point.y) < 0.01
    );
  }

  setX(x: number) {
    this.x = x;
  }

  setY(y: number) {
    this.y = y;
  }
}

export class PathSegment {
  start: Point;
  stop: Point;
  pathType: string;

  constructor(start: Point, stop: Point) {
    this.start = start;
    this.stop = stop;
    this.pathType = 'PathSegment';
  }
  isSimilar(path: PathSegment): boolean {
    return (
      this.pathType === path.pathType &&
      ((this.start.isSimilarNormalized(path.start) &&
        this.stop.isSimilarNormalized(path.stop)) ||
        (this.start.isSimilarNormalized(path.stop) &&
          this.stop.isSimilarNormalized(path.start)))
    );
  }
}

export class LineSegment extends PathSegment {
  constructor(start: Point, stop: Point) {
    super(start, stop);
    this.pathType = 'LineSegment';
  }
}

export class CurveSegment extends PathSegment {
  controlPoint1: Point;
  controlPoint2: Point;
  constructor(
    controlPoint1: Point,
    controlPoint2: Point,
    start: Point,
    stop: Point
  ) {
    super(start, stop);
    this.controlPoint1 = controlPoint1;
    this.controlPoint2 = controlPoint2;
    this.pathType = 'CurveSegment';
  }
}
