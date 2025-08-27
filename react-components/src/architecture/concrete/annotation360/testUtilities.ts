import { Vector3 } from 'three';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';
import { forEach } from 'lodash';

export const TEST_CONNECTED_IMAGE_ID = 'My Id';
export const TEST_CENTER = new Vector3(5, 6, 7);

export function createEmptyImage360Annotation(): Image360AnnotationDomainObject {
  return new Image360AnnotationDomainObject(TEST_CONNECTED_IMAGE_ID);
}

export function createSquareShapedAnnotation(): Image360AnnotationDomainObject {
  const domainObject = new Image360AnnotationDomainObject(TEST_CONNECTED_IMAGE_ID);
  domainObject.center.copy(TEST_CENTER);
  domainObject.points.push(...createSquareToEdgeOfUnitSphere());
  return domainObject;
}

export function addImage360Annotations(root: DomainObject, count: number): void {
  for (let i = 0; i < count; i++) {
    const domainObject = createEmptyImage360Annotation();
    root.addChildInteractive(domainObject);
  }
}

export function getNumberOfImage360Annotations(root: DomainObject): number {
  let count = 0;
  for (const _descendant of root.getDescendantsByType(Image360AnnotationDomainObject)) {
    count++;
  }
  return count;
}

export function createSquareToEdgeOfUnitSphere(): Vector3[] {
  const vectors: Vector3[] = [];
  const z = -5;
  vectors.push(new Vector3(0, 0, z));
  vectors.push(new Vector3(1, 0, z));
  vectors.push(new Vector3(1, 1, z));
  vectors.push(new Vector3(0, 1, z));
  forEach(vectors, (vector: Vector3) => vector.normalize());
  return vectors;
}
