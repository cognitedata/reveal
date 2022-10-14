/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import dat from 'dat.gui';

import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading model
export default class DefaultVisualTest extends ViewerVisualTestFixture {
  public async setup({ viewer }: ViewerTestFixtureComponents): Promise<void> {
    viewer.setBackgroundColor(new THREE.Color(0.1, 0.2, 0.3));
    const rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), degToRad(177));
    const translation = new THREE.Matrix4().makeTranslation(11, 49, 32);
    const collectionTransform = translation.multiply(rotation);
    const entities1 = await viewer.add360ImageSet('events', { site_id: 'helideck-site-2' }, { collectionTransform });

    const rotation2 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), degToRad(40));
    const translation2 = new THREE.Matrix4().makeTranslation(34, 30, 46);
    const collectionTransform2 = translation2.multiply(rotation2);
    const entities2 = await viewer.add360ImageSet(
      'events',
      { site_id: 'j-tube-diesel-header-tank' },
      { collectionTransform: collectionTransform2 }
    );

    const rotation3 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), degToRad(96));
    const translation3 = new THREE.Matrix4().makeTranslation(176, 37, 56);
    const collectionTransform3 = translation3.multiply(rotation3);
    const entities3 = await viewer.add360ImageSet(
      'events',
      { site_id: 'se-stairs-module-5-boot-room' },
      { collectionTransform: collectionTransform3 }
    );

    const gui = new dat.GUI();

    const guiData = {
      opacity: 1.0
    };
    const entities = entities1.concat(entities2).concat(entities3);
    gui.add(guiData, 'opacity', 0, 1).onChange(() => {
      entities.forEach(entity => (entity.opacity = guiData.opacity));
      viewer.requestRedraw();
    });
  }
}
