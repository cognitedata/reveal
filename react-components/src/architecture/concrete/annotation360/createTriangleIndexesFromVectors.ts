/*!
 * Copyright 2024 Cognite AS
 */

import { Quaternion, type Vector2Like, Vector3 } from 'three';
import { Vector3ArrayUtils } from '../../base/utilities/primitives/PointsUtils';

export function createTriangleIndexesFromVectors(vectors: Vector3[]): number[] | undefined {
  if (vectors.length < 3) {
    return undefined;
  }
  const center = Vector3ArrayUtils.getCenter(vectors);

  // Rotate to down, so the center of the vectors points down.
  // Then the z value is about -1 for all vectors.
  // We will use only x and y in the ear cutting, and z is ignored.
  const down = new Vector3(0, 0, -1);
  const axis = new Vector3().crossVectors(center, down).normalize();
  const angle = center.angleTo(down);
  const quaternion = new Quaternion().setFromAxisAngle(axis, angle);

  const transformed = vectors.map((vector) => vector.clone().applyQuaternion(quaternion));
  const area = Vector3ArrayUtils.getSignedHorizontalArea(transformed);
  if (area === 0) {
    return undefined;
  }
  // The ear cutting algorithm
  let linkedList: Point | undefined;
  for (const index of orderedIndexes(transformed.length, area < 0)) {
    linkedList = insertPointInLinkedList(index, transformed[index], linkedList);
  }
  if (linkedList === undefined) {
    return undefined;
  }
  linkedList = removeEqualAndColinearPoints(linkedList);
  return createIndexedTrianglesFromLinkedList(linkedList);

  // Some local functions here:

  function* orderedIndexes(count: number, reverse: boolean): Generator<number> {
    if (reverse) {
      for (let i = count - 1; i >= 0; i--) {
        yield i;
      }
    } else {
      for (let i = 0; i < count; i++) {
        yield i;
      }
    }
  }
}

function insertPointInLinkedList(index: number, point: Vector2Like, last?: Point): Point {
  const newPoint = new Point(index, point);
  if (last !== undefined) {
    newPoint.next = last.next;
    newPoint.prev = last;
    last.next.prev = newPoint;
    last.next = newPoint;
  }
  return newPoint;
}

function removeEqualAndColinearPoints(start: Point): Point {
  let current = start;
  let end = start;
  let more = false;
  do {
    more = false;
    if (current.equals(current.next) || current.getArea() === 0) {
      current.remove();
      current = end = current.prev;
      if (current === current.next) {
        break;
      }
      more = true;
    } else {
      current = current.next;
    }
  } while (more || current !== end);
  return end;
}

function createIndexedTrianglesFromLinkedList(current: Point): number[] | undefined {
  const triangles = [];
  let end = current;

  while (current.prev !== current.next) {
    const prev = current.prev;
    const next = current.next;

    if (isEar(current)) {
      triangles.push(prev.index, current.index, next.index);
      current.remove();
      current = next.next;
      end = next.next;
      continue;
    }
    current = next;
    if (current === end) {
      break;
    }
  }
  return triangles;
}

function isEar(ear: Point): boolean {
  // Reflex found.
  if (ear.getArea() >= 0) {
    return false;
  }
  const a = ear.prev;
  const b = ear;
  const c = ear.next;

  // Now make sure we don't have other points inside the potential ear.
  let point = c.next;
  while (point !== a) {
    const inTriangle = isInTriangle(a, b, c, point);
    if (inTriangle && point.getArea() >= 0) {
      return false;
    }
    point = point.next;
  }
  return true;
}

function isInTriangle(a: Point, b: Point, c: Point, p: Point): boolean {
  return (
    (c.x - p.x) * (a.y - p.y) - (a.x - p.x) * (c.y - p.y) >= 0 &&
    (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y) >= 0 &&
    (b.x - p.x) * (c.y - p.y) - (c.x - p.x) * (b.y - p.y) >= 0
  );
}

class Point {
  index: number;
  x: number;
  y: number;
  prev: Point;
  next: Point;

  constructor(index: number, point: Vector2Like) {
    this.index = index;
    this.x = point.x;
    this.y = point.y;
    this.prev = this;
    this.next = this;
  }

  public equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  public remove(): void {
    this.next.prev = this.prev;
    this.prev.next = this.next;
  }

  public getArea(): number {
    return area(this.prev, this, this.next);
    function area(a: Point, b: Point, c: Point): number {
      return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
    }
  }
}
