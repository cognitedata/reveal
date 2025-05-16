/*!
 * Copyright 2024 Cognite AS
 */

import { Quaternion, type Vector2Like, Vector3 } from 'three';
import { Vector3ArrayUtils } from './Vector3ArrayUtils';

const DOWN_VECTOR = new Vector3(0, 0, -1);
const MIN_ANGLE = Math.PI / 1000;

export function createTriangleIndexesFromVectors(vectors: Vector3[]): number[] | undefined {
  if (vectors.length < 3) {
    return undefined;
  }
  const dominateVector = Vector3ArrayUtils.getCenter(vectors);
  dominateVector.normalize();

  // Rotate to down, so the center of the vectors points down.
  // Then the z value is about -1 for all vectors.
  // We will use only x and y in the ear cutting, and z is ignored.
  let rotatedVectors = vectors;
  const angle = dominateVector.angleTo(DOWN_VECTOR);

  // Do not need to rotate if the dominate vector is pointing up or down
  if (!isAlmostUpOrDown(angle)) {
    const axis = new Vector3().crossVectors(dominateVector, DOWN_VECTOR).normalize();
    const quaternion = new Quaternion().setFromAxisAngle(axis, angle);
    rotatedVectors = vectors.map(vector => vector.clone().applyQuaternion(quaternion));
  }
  const area = Vector3ArrayUtils.getSignedHorizontalArea(rotatedVectors);
  if (area === 0) {
    return undefined;
  }
  // The ear cutting algorithm
  let linkedList: PolygonVertex | undefined;
  for (const index of orderedIndexes(rotatedVectors.length, area < 0)) {
    linkedList = insertPointInLinkedList(index, rotatedVectors[index], linkedList);
  }
  if (linkedList === undefined) {
    return undefined;
  }
  linkedList = removeEqualAndColinearPoints(linkedList);
  return createIndexedTrianglesFromLinkedList(linkedList);

  // Local functions:

  function isAlmostUpOrDown(angle: number): boolean {
    return angle < MIN_ANGLE || angle > Math.PI - MIN_ANGLE;
  }

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

function insertPointInLinkedList(index: number, point: Vector2Like, last?: PolygonVertex): PolygonVertex {
  const newPoint = new PolygonVertex(index, point);
  if (last !== undefined) {
    newPoint.next = last.next;
    newPoint.prev = last;
    last.next.prev = newPoint;
    last.next = newPoint;
  }
  return newPoint;
}

function removeEqualAndColinearPoints(start: PolygonVertex): PolygonVertex {
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

function createIndexedTrianglesFromLinkedList(current: PolygonVertex): number[] | undefined {
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

function isEar(ear: PolygonVertex): boolean {
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

function isInTriangle(a: PolygonVertex, b: PolygonVertex, c: PolygonVertex, p: PolygonVertex): boolean {
  return (
    (c.x - p.x) * (a.y - p.y) - (a.x - p.x) * (c.y - p.y) >= 0 &&
    (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y) >= 0 &&
    (b.x - p.x) * (c.y - p.y) - (c.x - p.x) * (b.y - p.y) >= 0
  );
}

class PolygonVertex {
  index: number;
  x: number;
  y: number;
  prev: PolygonVertex;
  next: PolygonVertex;

  constructor(index: number, point: Vector2Like) {
    this.index = index;
    this.x = point.x;
    this.y = point.y;
    this.prev = this;
    this.next = this;
  }

  public equals(other: PolygonVertex): boolean {
    return this.x === other.x && this.y === other.y;
  }

  public remove(): void {
    this.next.prev = this.prev;
    this.prev.next = this.next;
  }

  public getArea(): number {
    return area(this.prev, this, this.next);
    function area(a: PolygonVertex, b: PolygonVertex, c: PolygonVertex): number {
      return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
    }
  }
}
