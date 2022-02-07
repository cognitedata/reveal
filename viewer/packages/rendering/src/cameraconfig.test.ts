/**
 * Copyright 2022 Cognite AS
 */

import { V9SectorMetadata } from '@reveal/cad-parsers';
import * as THREE from 'three';

import { generateV9SectorTree } from '../../../test-utilities/src/createSectorMetadata';

import { suggestCameraConfig } from './cameraconfig';

describe('cameraconfig', () => {
  let sectorTree: V9SectorMetadata;

  beforeEach(() => {
    sectorTree = generateV9SectorTree(3, 3);
  });

  test('camera target is inside bounding box', () => {
    const config = suggestCameraConfig(sectorTree, new THREE.Matrix4().identity());

    expect(sectorTree.bounds.containsPoint(config.target)).toBeTrue();
  });

  test('camera angle is less than 30 degrees below horizon', () => {
    const config = suggestCameraConfig(sectorTree, new THREE.Matrix4().identity());

    const dir = config.target.clone().sub(config.position).normalize();

    expect(Math.abs(dir.y)).toBeLessThanOrEqual(Math.sin((Math.PI * 30) / 180));
  });
});
