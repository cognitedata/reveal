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

/**
 * Convenience implementation to represent an empty collection of areas.
 * that can be shared among several instances.
 */
export class EmptyAreaCollection {
  private static _instance: EmptyAreaCollection | undefined;

  public static instance(): AreaCollection {
    EmptyAreaCollection._instance = EmptyAreaCollection._instance || new EmptyAreaCollection();
    return EmptyAreaCollection._instance;
  }

  private constructor() {}

  *areas(): Generator<THREE.Box3> {}
}
