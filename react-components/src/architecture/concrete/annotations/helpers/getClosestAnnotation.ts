import { type Matrix4, type Ray, type Vector3 } from 'three';
import { type Annotation } from './Annotation';
import { type Primitive } from '../../../base/utilities/primitives/Primitive';
import { ClosestGeometryFinder } from '@cognite/reveal';

export function getClosestAnnotation(
  annotations: Generator<Annotation>,
  globalMatrix: Matrix4,
  ray: Ray
): ClosestGeometryFinder<AnnotationIntersectInfo> {
  const closestFinder = new ClosestGeometryFinder<AnnotationIntersectInfo>(ray.origin);

  for (const annotation of annotations) {
    for (const primitive of annotation.primitives) {
      const point = primitive.intersectRay(ray, globalMatrix);
      if (point === undefined) {
        continue;
      }
      const closest = closestFinder.getClosestGeometry();

      const isOverlappingWithClosestGeometry = (): boolean => {
        if (closest === undefined) {
          return false;
        }
        return (
          closest.primitive.isPointInside(point, globalMatrix) ||
          primitive.isPointInside(closest.point, globalMatrix)
        );
      };
      if (closest === undefined || !isOverlappingWithClosestGeometry()) {
        closestFinder.addLazy(
          point,
          () => new AnnotationIntersectInfo(annotation, primitive, point)
        );
        continue;
      }
      if (closest.volume === undefined) {
        closest.volume = closest.primitive.volume; // Optimization, lazy calculation
      }
      const volume = primitive.volume;
      if (volume > closest.volume) {
        continue; // Select the one with the smallest volume
      }
      closestFinder.clear();
      const info = new AnnotationIntersectInfo(annotation, primitive, point);
      info.volume = volume;
      closestFinder.add(point, info);
    }
  }
  return closestFinder;
}

export class AnnotationIntersectInfo {
  public annotation: Annotation;
  public primitive: Primitive;
  public point: Vector3;
  public volume: number | undefined = undefined;

  constructor(annotation: Annotation, primitive: Primitive, point: Vector3) {
    this.annotation = annotation;
    this.primitive = primitive;
    this.point = point;
  }

  public get primitiveIndex(): number | undefined {
    const index = this.annotation.primitives.indexOf(this.primitive);
    return index >= 0 ? index : undefined;
  }
}
