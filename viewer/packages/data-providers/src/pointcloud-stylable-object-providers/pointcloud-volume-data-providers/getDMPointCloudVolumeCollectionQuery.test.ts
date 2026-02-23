/*!
 * Copyright 2024 Cognite AS
 */

import { getDMPointCloudVolumeCollectionQuery } from './getDMPointCloudVolumeCollectionQuery';

describe(getDMPointCloudVolumeCollectionQuery.name, () => {
  test('query select includes object3D for DMS pagination alignment', () => {
    const query = getDMPointCloudVolumeCollectionQuery('revision-1', 'test-space');

    expect(query.select).toHaveProperty('object3D');
    expect(query.select.object3D).toBeDefined();
  });

  test('query select includes pointCloudVolumes and assets', () => {
    const query = getDMPointCloudVolumeCollectionQuery('revision-1', 'test-space');

    expect(query.select).toHaveProperty('pointCloudVolumes');
    expect(query.select).toHaveProperty('assets');
  });

  test('query with clause has pointCloudVolumes, object3D and assets chain', () => {
    const query = getDMPointCloudVolumeCollectionQuery('revision-1', 'test-space');

    expect(query.with).toHaveProperty('pointCloudVolumes');
    expect(query.with).toHaveProperty('object3D');
    expect(query.with).toHaveProperty('assets');
    expect(query.with.object3D.nodes.from).toBe('pointCloudVolumes');
    expect(query.with.assets.nodes.from).toBe('object3D');
  });
});
