/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { AutoDisposeGroup } from './AutoDisposeGroup';

import { jest } from '@jest/globals';

describe('AutoDisposeGroup', () => {
  let mesh: THREE.Mesh;
  let geometry: THREE.BufferGeometry;
  let group: AutoDisposeGroup;

  beforeEach(() => {
    geometry = new THREE.BufferGeometry();
    mesh = new THREE.Mesh(geometry);
    group = new AutoDisposeGroup();
    group.add(mesh);
  });

  test('reference then dereference, disposes geometry', () => {
    const disposeSpy = jest.spyOn(geometry, 'dispose');
    group.reference();
    group.dereference();
    expect(disposeSpy).toBeCalledTimes(1);
  });

  test('reference twice and dererence once, doesnt dispose geometry', () => {
    const disposeSpy = jest.spyOn(geometry, 'dispose');
    group.reference();
    group.reference();
    group.dereference();
    expect(disposeSpy).not.toBeCalled();
  });

  test('dereference before referenced, throws', () => {
    expect(() => group.dereference()).toThrowError();
  });

  test('dereference already disposed group, throws', () => {
    group.reference();
    group.dereference();
    expect(() => group.dereference()).toThrowError();
  });

  test('mesh in grand-child is not automatically disposed', () => {
    const disposeSpy = jest.spyOn(geometry, 'dispose');

    group.remove(mesh);

    const subGroup = new THREE.Group();
    subGroup.add(mesh);
    group.add(subGroup);

    group.reference();
    group.dereference();

    expect(disposeSpy).not.toBeCalled();
  });

  test('addTexture adds texture and disposes it when group is disposed', () => {
    // Arrange
    const texture = new THREE.Texture();
    const disposeSpy = jest.spyOn(texture, 'dispose');

    // Act
    group.addTexture(texture);
    group.reference();
    group.dereference();

    // Assert
    expect(disposeSpy).toBeCalledTimes(1);
  });

  test('isDisposed returns correct disposal state', () => {
    // Initially not disposed
    expect(group.isDisposed()).toBe(false);

    // After referencing, still not disposed
    group.reference();
    expect(group.isDisposed()).toBe(false);

    // After dereferencing, should be disposed
    group.dereference();
    expect(group.isDisposed()).toBe(true);
  });

  test('dispose clears all children from group', () => {
    // Arrange
    const mesh1 = new THREE.Mesh(new THREE.BufferGeometry());
    const mesh2 = new THREE.Mesh(new THREE.BufferGeometry());
    group.add(mesh1);
    group.add(mesh2);

    expect(group.children.length).toBe(3);

    // Act
    group.reference();
    group.dereference();

    // Assert
    expect(group.children.length).toBe(0);
  });
});
