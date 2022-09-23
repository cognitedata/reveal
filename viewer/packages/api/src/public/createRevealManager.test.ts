/*!
 * Copyright 2022 Cognite AS
 */

import { createRevealManager } from './createRevealManager';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';

import { It, Mock, SetPropertyExpression } from 'moq.ts';

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import { IAnnotationProvider } from '@reveal/pointclouds';
import { IPointClassificationsProvider } from '@reveal/pointclouds';

describe('createRevealManager', () => {
  test('createRevealManager does not throw on empty internal options', () => {
    expect(() =>
      createRevealManager(
        'some-project',
        'some-application-id',
        new Mock<ModelMetadataProvider>().object(),
        new Mock<ModelDataProvider>().object(),
        new Mock<IAnnotationProvider>().object(),
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
        {}
      )
    ).not.toThrow();
  });
});
