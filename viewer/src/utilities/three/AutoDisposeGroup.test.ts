/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { AutoDisposeGroup } from './AutoDisposeGroup';

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
});
