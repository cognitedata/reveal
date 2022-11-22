/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

/**
 * Provides metadata needed to get asset mappings for a CDF 3D model
 */
export interface CdfModelNodeCollectionDataProvider {
  /**
   * Gets the transformation of the model in ThreeJS space
   */
  getModelTransformation(out?: THREE.Matrix4): THREE.Matrix4;

  /**
   * Gets the source (+ default) transformation of the model from e.g. CDF space.
   * The current total transformation of the model from the backend to its transform in ThreeJS space
   * is thus `model.getCdfToDefaultModelTransformation() * model.getModelTransformation()`.
   */
  getCdfToDefaultModelTransformation(out?: THREE.Matrix4): THREE.Matrix4;

  /**
   * Total count of nodes in the model
   */
  nodeCount: number;

  /**
   * Model and revision IDs for the model
   */
  modelId: number;
  revisionId: number;
}
