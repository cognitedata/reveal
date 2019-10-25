/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { LoadSectorRequest } from '../../../sector/types';
import { discardSector } from '../../../views/threejs/discardSector';
import { SectorNode } from '../../../views/threejs/SectorNode';
import 'jest-extended';

describe('discardSector', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const request: LoadSectorRequest = {
    promise: Promise.resolve(),
    status: jest.fn(),
    cancel: jest.fn()
  };
  const node = new SectorNode();

  test('cancels request', () => {
    discardSector(1, request, node);
    expect(request.cancel).toBeCalled();
  });

  test('removes geometry, but keeps sectors', () => {
    node.add(new SectorNode());
    node.add(new SectorNode());
    node.add(new THREE.Box3Helper(new THREE.Box3()));
    discardSector(1, request, node);

    expect(node.children.length).toBe(2);
    expect(node.children).toSatisfyAll(x => x instanceof SectorNode);
  });

  test('discard undefined request does not throw', () => {
    expect(() => discardSector(1, undefined, node)).not.toThrow();
  });
});
