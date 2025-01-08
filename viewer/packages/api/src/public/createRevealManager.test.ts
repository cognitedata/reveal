/*!
 * Copyright 2022 Cognite AS
 */

import { createRevealManager } from './createRevealManager';

import {
  CoreDMDataSourceType,
  ModelDataProvider,
  ModelMetadataProvider,
  PointCloudStylableObjectProvider
} from '@reveal/data-providers';

import { It, Mock, SetPropertyExpression } from 'moq.ts';

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import { IPointClassificationsProvider } from '@reveal/pointclouds';
import { CameraManager } from '@reveal/camera-manager';

describe('createRevealManager', () => {
  test('createRevealManager does not throw on empty internal options', () => {
    expect(() =>
      createRevealManager(
        'some-project',
        'some-application-id',
        new Mock<ModelMetadataProvider>().object(),
        new Mock<ModelDataProvider>().object(),
        new Mock<PointCloudStylableObjectProvider>().object(),
        new Mock<PointCloudStylableObjectProvider<CoreDMDataSourceType>>().object(),
        new Mock<IPointClassificationsProvider>().object(),
        new Mock<THREE.WebGLRenderer>()
          .setup(_ => It.Is((expression: SetPropertyExpression) => expression.name === 'info'))
          .returns({})
          .setup(p => p.domElement)
          .returns(
            new Mock<HTMLCanvasElement>()
              .setup(p => p.parentElement)
              .returns(new Mock<HTMLElement>().object())
              .object()
          )
          .object(),
        new SceneHandler(),
        new Mock<CameraManager>()
          .setup(p => p.on(It.IsAny(), It.IsAny()))
          .returns()
          .object(),
        {}
      )
    ).not.toThrow();
  });
});
