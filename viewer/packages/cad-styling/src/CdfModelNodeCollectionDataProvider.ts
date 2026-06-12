/*!
 * Copyright 2022 Cognite AS
 */

import type { Matrix4 } from 'three';

/**
 * Provides metadata needed to get asset mappings for a CDF 3D model
 */
export interface CdfModelNodeCollectionDataProvider {
  /**
   * Gets the transformation of the model in ThreeJS space
   */
  getModelTransformation(out?: Matrix4): Matrix4;

  /**
   * Gets the default transformation of the model from CDF space.
   * The current total transformation of the model from the backend to its transform in ThreeJS space
   * is thus `model.getCdfToDefaultModelTransformation() * model.getModelTransformation()`.
   */
  getCdfToDefaultModelTransformation(out?: Matrix4): Matrix4;

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
