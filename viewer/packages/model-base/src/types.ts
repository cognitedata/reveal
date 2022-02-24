/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorCuller } from '@reveal/cad-geometry-loaders';
import { SectorQuads, RenderOptions } from '@reveal/rendering';
import { SectorGeometry } from '@reveal/cad-parsers';

export interface IntersectInput {
  normalizedCoords: {
    x: number;
    y: number;
  };
  camera: THREE.PerspectiveCamera;
  clippingPlanes: THREE.Plane[];
  renderer: THREE.WebGLRenderer;
  domElement: HTMLElement;
}

/**
 * @property logMetrics Might be used to disable usage statistics.
 * @property nodeAppearanceProvider Style node by tree-index.
 * @property internal Internals are for internal usage only (like unit-testing).
 */
export type RevealOptions = {
  logMetrics?: boolean;
  renderOptions?: RenderOptions;
  continuousModelStreaming?: boolean;
  internal?: {
    parseCallback?: (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
};
