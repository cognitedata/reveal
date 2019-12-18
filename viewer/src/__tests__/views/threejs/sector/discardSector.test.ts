/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { LoadSectorRequest, SectorModelTransformation } from '../../../../models/sector/types';
import { discardSector } from '../../../../views/threejs/sector/discardSector';
import { SectorNode } from '../../../../views/threejs/sector/SectorNode';
import 'jest-extended';
import { mat4 } from 'gl-matrix';

describe('discardSector', () => {
  const sectorId = 1;
  let node: SectorNode;

  beforeEach(() => {
    node = new SectorNode(sectorId, '0/');
    jest.resetAllMocks();
  });

  test('removes geometry, but keeps sectors', () => {
    node.add(new SectorNode(sectorId + 1, '0/1/'));
    node.add(new SectorNode(sectorId + 2, '0/2/'));
    node.add(new THREE.Box3Helper(new THREE.Box3()));
    discardSector(1, node);

    expect(node.children.length).toBe(2);
    expect(node.children).toSatisfyAll(x => x instanceof SectorNode);
  });

  test('discard undefined request does not throw', () => {
    expect(() => discardSector(1, node)).not.toThrow();
  });
});
