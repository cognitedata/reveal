/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

/**
 * Provides metadata needed to get asset mappings for a CDF 3D model
 */
export interface CdfModelNodeCollectionDataProvider {
  /**
   * Maps a box from Reveal space to CDF space
   */
  mapBoxFromModelToCdfCoordinates: (box: THREE.Box3, out?: THREE.Box3) => THREE.Box3;

  /**
   * Maps a box from CDF space to Reveal space
   */
  mapBoxFromCdfToModelCoordinates: (box: THREE.Box3, out?: THREE.Box3) => THREE.Box3;

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
