/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading model
export default class DefaultVisualTest extends ViewerVisualTestFixture {
  public async setup(components: ViewerTestFixtureComponents): Promise<void> {
    const { viewer } = components;
    const rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), 0.1);
    const translation = new THREE.Matrix4().makeTranslation(-18, 1, -13);
    const transform = translation.multiply(rotation);
    await viewer.add360ImageSet('events', { site_id: '6th floor v3 - enterprise' }, transform);
    return Promise.resolve();
  }
}
