/*!
 * Copyright 2022 Cognite AS
 */

import {
  StreamingTestFixtureComponents,
  StreamingVisualTestFixture
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { PointCloudFactory } from '../src/PointCloudFactory';
import { cdfAnnotationsToObjectInfo } from '../../data-providers/src/pointcloud-stylable-object-providers/cdfAnnotationsToObjects';
import { PointCloudObject, PointCloudStylableObjectProvider } from '../../data-providers';
import { Cylinder } from '../../utilities';
import { PointCloudNode } from '../src/PointCloudNode';
import {
  AnnotationIdPointCloudObjectCollection,
  StyledPointCloudObjectCollection,
  applyDefaultsToPointCloudAppearance
} from '../../pointcloud-styling';

import { PointCloudMaterialManager } from '../../rendering';

import { ModelIdentifier } from '@reveal/data-providers';

import assert from 'assert';
import * as THREE from 'three';
import { LocalPointClassificationsProvider } from '../src/classificationsProviders/LocalPointClassificationsProvider';

class CustomAnnotationProvider implements PointCloudStylableObjectProvider {
  async getPointCloudObjects(_modelIdentifier: ModelIdentifier): Promise<PointCloudObject[]> {
    const cdfAnnotations = [
      {
        annotationId: 123,
        region: [new Cylinder(new THREE.Vector3(-0.03, 0.1, -1000), new THREE.Vector3(-0.03, 0.1, 1000), 0.04)]
      }
    ];
    const annotationData = cdfAnnotationsToObjectInfo(cdfAnnotations);

    return annotationData;
  }
}

export default class PointCloudColorStylingVisualTest extends StreamingVisualTestFixture {
  constructor() {
    super('pointcloud-bunny');
  }

  override createPointCloudFactory(): PointCloudFactory {
    return new PointCloudFactory(
      this.modelDataProvider,
      new CustomAnnotationProvider(),
      new LocalPointClassificationsProvider(),
      new PointCloudMaterialManager()
    );
  }

  override createCamera(): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1.5);
  }

  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model } = testFixtureComponents;

    assert(model.geometryNode instanceof PointCloudNode);

    const stylableObjectIds: number[] = [];
    [...model.geometryNode.potreeNode.stylableObjectAnnotationMetadata].forEach(m =>
      stylableObjectIds.push(m.annotationId)
    );

    const objectCollection = new AnnotationIdPointCloudObjectCollection(stylableObjectIds);
    const appearance = { color: [0, 255, 0] as [number, number, number], visible: true };

    model.geometryNode.pointSize = 5;
    model.geometryNode.assignStyledPointCloudObjectCollection(
      new StyledPointCloudObjectCollection(objectCollection, appearance)
    );
    model.geometryNode.defaultAppearance = applyDefaultsToPointCloudAppearance({ visible: false });

    return Promise.resolve();
  }
}
