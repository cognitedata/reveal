/*!
 * Copyright 2021 Cognite AS
 */
export interface AreaCollection {
  areas(): Generator<THREE.Box3>;
}

export class SimpleAreaCollection {
  private readonly _areas: THREE.Box3[] = [];

  addArea(area: THREE.Box3) {
    this._areas.push(area);
  }

  *areas(): Generator<THREE.Box3> {
    return this._areas;
  }
}
