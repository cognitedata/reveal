/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { discardSector } from '../../../../views/threejs/cad/discardSector';
import { SectorNode } from '../../../../views/threejs/cad/SectorNode';
import 'jest-extended';

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

  test('disposes geometry and material', () => {
    // Arrange
    const geometryDisposeMock = jest.fn();
    const materialDisposeMock = jest.fn();
    THREE.Geometry.prototype.dispose = geometryDisposeMock;
    THREE.Material.prototype.dispose = materialDisposeMock;
    const mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.Material());
    node.add(mesh);

    // Act
    discardSector(1, node);

    // Assert
    expect(geometryDisposeMock).toBeCalledTimes(1);
    expect(materialDisposeMock).toBeCalledTimes(1);
  });

  test('disposes all materials when mesh has multiple materials', () => {
    // Arrange
    const materialDisposeMock = jest.fn();
    THREE.Material.prototype.dispose = materialDisposeMock;
    const mesh = new THREE.Mesh(new THREE.Geometry());
    mesh.material = [new THREE.Material(), new THREE.Material()];
    node.add(mesh);

    // Act
    discardSector(1, node);

    // Assert
    expect(materialDisposeMock).toBeCalledTimes(2);
  });
});
