/*!
 * Copyright 2021 Cognite AS
 */

import { EmptyAreaCollection } from './EmptyAreaCollection';

import { Box3 } from 'three';

describe('EmptyAreaCollection', () => {
  test('empty area collection does empty area collection stuff', () => {
    const areaCollection = EmptyAreaCollection.instance();

    expect(areaCollection).toBeTruthy();

    expect(() => areaCollection.addAreas([new Box3()])).toThrow();
    expect(() => areaCollection.intersectWith([new Box3()])).not.toThrow();

    expect(areaCollection.isEmpty).toBeTruthy();
  });
});
