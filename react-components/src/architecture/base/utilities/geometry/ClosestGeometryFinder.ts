/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector3 } from 'three';

export class ClosestGeometryFinder<T> {
  private closestGeometry: T | undefined = undefined;
  private readonly origin: Vector3;
  private minDistanceSquared = Number.MAX_VALUE;

  public constructor(origin: Vector3) {
    this.origin = origin;
    this.clear();
  }

  public set minDistance(value: number) {
    this.minDistanceSquared = value * value;
  }

  public get minDistance(): number {
    return Math.sqrt(this.minDistanceSquared);
  }

  public getClosestGeometry(): T | undefined {
    return this.closestGeometry;
  }

  public setClosestGeometry(geometry: T): void {
    this.closestGeometry = geometry;
  }

  public isClosest(point: Vector3): boolean {
    const distanceSquared = point.distanceToSquared(this.origin);
    if (distanceSquared > this.minDistanceSquared) {
      return false;
    }
    this.minDistanceSquared = distanceSquared;
    return true;
  }

  public clear(): void {
    this.closestGeometry = undefined;
    this.minDistanceSquared = Number.MAX_VALUE;
  }

  public add(point: Vector3, geometry: T): boolean {
    if (!this.isClosest(point)) {
      return false;
    }
    this.setClosestGeometry(geometry);
    return true;
  }

  public addLazy(point: Vector3, geometryCreator: () => T): boolean {
    if (!this.isClosest(point)) {
      return false;
    }
    this.setClosestGeometry(geometryCreator());
    return true;
  }
}
