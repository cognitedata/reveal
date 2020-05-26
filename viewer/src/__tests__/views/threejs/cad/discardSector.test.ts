/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import 'jest-extended';
import { discardSector } from '@/datamodels/cad/sector/sectorUtilities';

describe('discardSector', () => {
  let node: THREE.Group;

  beforeEach(() => {
    node = new THREE.Group();
    jest.resetAllMocks();
  });

  test('discard undefined request does not throw', () => {
    expect(() => discardSector(node)).not.toThrow();
  });

  test('disposes geometry', () => {
    // Arrange
    const geometryDisposeMock = jest.fn();
    THREE.Geometry.prototype.dispose = geometryDisposeMock;
    const mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.Material());
    node.add(mesh);

    // Act
    discardSector(node);

    // Assert
    expect(geometryDisposeMock).toBeCalledTimes(1);
  });
});
