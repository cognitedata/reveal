/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';
import { WantedSector } from '../WantedSector';
import { LevelOfDetail } from '../LevelOfDetail';
import { SectorMetadata } from '../types';
import { CadLoadingHints } from '../../../public/CadLoadingHints';
import { CadModelMetadata } from '@/dataModels/cad/public/CadModelMetadata';

export interface DetermineSectorsInput {
  camera: THREE.PerspectiveCamera;
  clippingPlanes: THREE.Plane[];
  cadModelsMetadata: CadModelMetadata[];
  loadingHints: CadLoadingHints;
}

export type PrioritizedWantedSector = WantedSector & { priority: number };

/**
 * Delegates that computes 'cost' of loading/visualizing a given sector.
 */
export type DetermineSectorCostDelegate = (sector: SectorMetadata, levelOfDetail: LevelOfDetail) => number;
