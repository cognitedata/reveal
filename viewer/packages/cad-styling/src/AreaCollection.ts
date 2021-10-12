/*!
 * Copyright 2021 Cognite AS
 */
export interface AreaCollection {
  readonly isEmpty: boolean;
  areas(): Generator<THREE.Box3>;
  intersectsBox(box: THREE.Box3): boolean;
}

export class SimpleAreaCollection {
  private readonly _areas: THREE.Box3[] = [];

  addArea(area: THREE.Box3) {
    this._areas.push(area);
  }

  *areas(): Generator<THREE.Box3> {
    return this._areas;
  }

  get isEmpty(): boolean {
    return this._areas.length === 0;
  }

  intersectsBox(box: THREE.Box3): boolean {
    for (const area of this.areas()) {
      if (area.intersectsBox(box)) {
        return true;
      }
    }
    return false;
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

  intersectsBox(_box: THREE.Box3): boolean {
    return false;
  }

  get isEmpty(): boolean {
    return true;
  }
}
