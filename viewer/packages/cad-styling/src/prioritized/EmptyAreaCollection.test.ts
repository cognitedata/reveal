/*!
 * Copyright 2021 Cognite AS
 */

import { EmptyAreaCollection } from './EmptyAreaCollection';

import * as THREE from 'three';

describe('EmptyAreaCollection', () => {
  test('empty area collection does empty area collection stuff', () => {
    const areaCollection = EmptyAreaCollection.instance();

    expect(areaCollection).toBeTruthy();

    expect(() => areaCollection.addAreas([new THREE.Box3()])).toThrowError();
    expect(() => areaCollection.intersectWith([new THREE.Box3()])).not.toThrow();

    expect(areaCollection.isEmpty).toBeTrue();
  });
});
