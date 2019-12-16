/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { LoadSectorRequest, SectorModelTransformation } from '../../../../models/sector/types';
import { discardSector } from '../../../../views/threejs/sector/discardSector';
import { SectorNode } from '../../../../views/threejs/sector/SectorNode';
import 'jest-extended';
import { mat4 } from 'gl-matrix';

const modelTransformation: SectorModelTransformation = {
  modelMatrix: mat4.create(),
  inverseModelMatrix: mat4.create()
};

describe('discardSector', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const request: LoadSectorRequest = {
    promise: Promise.resolve(),
    status: jest.fn(),
    cancel: jest.fn()
  };
  const node = new SectorNode({ modelTransformation });

  test('cancels request', () => {
    discardSector(1, node);
    expect(request.cancel).toBeCalled();
  });

  test('removes geometry, but keeps sectors', () => {
    node.add(new SectorNode({ modelTransformation }));
    node.add(new SectorNode({ modelTransformation }));
    node.add(new THREE.Box3Helper(new THREE.Box3()));
    discardSector(1, node);

    expect(node.children.length).toBe(2);
    expect(node.children).toSatisfyAll(x => x instanceof SectorNode);
  });

  test('discard undefined request does not throw', () => {
    expect(() => discardSector(1, node)).not.toThrow();
  });
});
