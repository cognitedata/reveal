/*!
 * Copyright 2021 Cognite AS
 */

export interface AreaCollection {
  readonly isEmpty: boolean;
  areas(): Generator<THREE.Box3>;
  intersectsBox(box: THREE.Box3): boolean;

  addAreas(boxes: Iterable<THREE.Box3>): void;
  intersectWith(boxes: Iterable<THREE.Box3>): void;
}
