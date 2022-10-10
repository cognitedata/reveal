/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudNode } from './PointCloudNode';
import { createPointCloudNode } from '../../../test-utilities';

import * as THREE from 'three';

describe(PointCloudNode.name, () => {
  test('getModelTransformation returns transformation set by setModelTransformation', () => {
    const node = createPointCloudNode();
    const transform = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(190, 35, 230))
      .setPosition(new THREE.Vector3(12, 34, 12));

    node.setModelTransformation(transform.clone());
    const receivedTransform = node.getModelTransformation();

    expect(receivedTransform).toEqual(transform);
  });
});
