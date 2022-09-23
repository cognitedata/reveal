/*!
 * Copyright 2022 Cognite AS
 */

import {
  StreamingTestFixtureComponents,
  StreamingVisualTestFixture
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { PointCloudFactory } from '../src/PointCloudFactory';
import { annotationsToObjectInfo } from '../src/styling/annotationsToObjects';
import { IAnnotationProvider } from '../src/styling/IAnnotationProvider';
import { ShapeType } from '../src/styling/shapes/IShape';
import { PointCloudObjectAnnotationData } from '../src/styling/PointCloudObjectAnnotationData';
import { PointCloudNode } from '../src/PointCloudNode';
import { AnnotationIdPointCloudObjectCollection } from '../src/styling/AnnotationListPointCloudObjectCollection';
import { StyledPointCloudObjectCollection } from '../src/styling/StyledPointCloudObjectCollection';

import { ModelIdentifier } from '@reveal/modeldata-api';

import assert from 'assert';
import * as THREE from 'three';
import { applyDefaultsToPointCloudAppearance } from '../src/styling/PointCloudAppearance';
import { LocalPointClassificationsProvider } from '../src/classificationsProviders/LocalPointClassificationsProvider';

class CustomAnnotationProvider implements IAnnotationProvider {
  async getAnnotations(_modelIdentifier: ModelIdentifier): Promise<PointCloudObjectAnnotationData> {
    const cdfAnnotations = [
      {
        annotationId: 123,
        region: [
          { shapeType: ShapeType.Cylinder, centerA: [-0.03, 0.1, -1000], centerB: [-0.03, 0.1, 1000], radius: 0.04 }
        ]
      }
    ];
    const annotationData = annotationsToObjectInfo(cdfAnnotations);

    return annotationData;
  }
}

export default class PointCloudColorStylingVisualTest extends StreamingVisualTestFixture {
  constructor() {
    super('pointcloud-bunny');
  }

  override createPointCloudFactory(): PointCloudFactory {
    return new PointCloudFactory(
      this.potreeInstance,
      new CustomAnnotationProvider(),
      new LocalPointClassificationsProvider()
    );
  }

  override createCamera(): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1.5);
  }

  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model } = testFixtureComponents;

    assert(model.geometryNode instanceof PointCloudNode);

    const stylableObjectIds: number[] = [];
    [...model.geometryNode.potreeNode.stylableObjectAnnotationIds].forEach(m => stylableObjectIds.push(m.annotationId));

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
