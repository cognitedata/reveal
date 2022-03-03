/*!
 * Copyright 2022 Cognite AS
 */

export type NodeTypeExistences = { back: boolean; inFront: boolean; ghost: boolean };

export interface SceneComponentsProvider {
  splitScene(): NodeTypeExistences;
  restoreScene(): void;

  getCustomScene(): THREE.Scene;

  getCadScene(): THREE.Scene;

  prepareNormalScene(): void;
  getNormalScene(): THREE.Scene;
  restoreNormalScene(): void;

  prepareInFrontScene(): void;
  getInFrontScene(): THREE.Scene;
  restoreInFrontScene(): void;

  getGhostScene(): THREE.Scene;

  setVisibilityOfSimpleSectors(visibility: boolean): void;
}
