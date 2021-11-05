/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CadModelMetadata, SectorMetadata } from '@reveal/cad-parsers';
import { CadModelClipper } from './CadModelClipper';
import { createCadModelMetadata } from '../../../../../test-utilities/src/createCadModelMetadata';
import { generateV8SectorTree } from '../../../../../test-utilities/src/createSectorMetadata';
import { Mutable } from '../../../../../test-utilities/src/reflection';

describe('CadModelClipper', () => {
  // Model with depth 2 where root has 8 children. Bounds is <[0,0,0], [2,2,2]>
  // and children splits the bounds in 8 with no overlap
  let modelDepth2: CadModelMetadata;

  beforeEach(() => {
    const root = generateV8SectorTree(2, 8);
    setBounds(root, [0, 0, 0], [2, 2, 2]);
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 2; z++) {
          const idx = x * 4 + y * 2 + z;
          setBounds(root.children[idx], [x, y, z], [x + 1, y + 1, z + 1]);
        }
      }
    }
    modelDepth2 = createCadModelMetadata(root);
  });

  test('createClippedModel() throws when there are no sectors inside clip box', () => {
    const box = new THREE.Box3(new THREE.Vector3(9, 9, 9), new THREE.Vector3(10, 10, 10));
    const clipper = new CadModelClipper(box);

    expect(() => clipper.createClippedModel(modelDepth2)).toThrowError();
  });

  test('createClippedModel() only keeps sectors intersecting with clip box', () => {
    const box = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(0.5, 0.5, 0.5));
    const clipper = new CadModelClipper(box);

    const result = clipper.createClippedModel(modelDepth2);
    const sectors = result.scene.getAllSectors();

    expect(result.scene.sectorCount).toBe(2);
    sectors.forEach(s => {
      expect(box.intersectsBox(s.bounds)).toBeTrue();
    });
  });

  test('createClippedModel() reduces estimated draw calls and render cost for clipped sectors', () => {
    const box = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 0.5, 0.5));
    const clipper = new CadModelClipper(box);

    const result = clipper.createClippedModel(modelDepth2);
    const sectors = result.scene.getAllSectors();

    sectors.forEach(s => {
      const original = modelDepth2.scene.getSectorById(s.id)!;
      expect(s.estimatedDrawCallCount).toBeLessThan(original.estimatedDrawCallCount);
      expect(s.estimatedRenderCost).toBeLessThan(original.estimatedRenderCost);
    });
  });
});

function setBounds(sector: SectorMetadata, min: [number, number, number], max: [number, number, number]) {
  const mutable: Mutable<SectorMetadata> = sector;
  mutable.bounds = new THREE.Box3().setFromArray([...min, ...max]);
}
