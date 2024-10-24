/*!
 * Copyright 2022 Cognite AS
 */

import {
  StreamingTestFixtureComponents,
  StreamingVisualTestFixture
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { PointCloudFactory } from '../src/PointCloudFactory';
import { cdfAnnotationsToObjectInfo } from '../../data-providers/src/pointcloud-stylable-object-providers/cdfAnnotationsToObjects';
import {
  DMDataSourceType,
  DataSourceType,
  PointCloudObject,
  PointCloudStylableObjectProvider
} from '../../data-providers';
import { Cylinder } from '../../utilities';
import { PointCloudNode } from '../src/PointCloudNode';
import {
  AnnotationIdPointCloudObjectCollection,
  StyledPointCloudAnnotationVolumeCollection,
  applyDefaultsToPointCloudAppearance
} from '../../pointcloud-styling';

import { ModelIdentifier } from '@reveal/data-providers';

import assert from 'assert';
import * as THREE from 'three';
import { LocalPointClassificationsProvider } from '../src/classificationsProviders/LocalPointClassificationsProvider';
import { PointColorType } from '@reveal/rendering';
import { Color } from 'three';

class CustomAnnotationProvider implements PointCloudStylableObjectProvider {
  async getPointCloudObjects(_modelIdentifier: ModelIdentifier): Promise<PointCloudObject[]> {
    const cdfAnnotations = [
      {
        annotationId: 123,
        region: [new Cylinder(new THREE.Vector3(-0.03, 0.1, -1000), new THREE.Vector3(-0.03, 0.1, 1000), 0.03478)]
      }
    ];

    return cdfAnnotationsToObjectInfo(cdfAnnotations);
  }
}

class CustomDMProvider implements PointCloudStylableObjectProvider<DMDataSourceType> {
  async getPointCloudObjects<DMPointCloudDataType extends DataSourceType>(
    _modelIdentifier: ModelIdentifier
  ): Promise<PointCloudObject<DMPointCloudDataType>[]> {
    const cdfAnnotations = [
      {
        annotationId: 0,
        volumeInstanceRef: { externalId: '123', space: 'space' },
        region: [new Cylinder(new THREE.Vector3(-0.03, 0.1, -1000), new THREE.Vector3(-0.03, 0.1, 1000), 0.03478)]
      }
    ];

    return cdfAnnotationsToObjectInfo(cdfAnnotations);
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
      new CustomDMProvider(),
      new LocalPointClassificationsProvider(),
      this._pcMaterialManager
    );
  }

  override createCamera(): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1.5);
  }

  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model } = testFixtureComponents;

    assert(model.geometryNode instanceof PointCloudNode);

    const stylableObjectIds: number[] = [];
    [...model.geometryNode.stylableVolumeMetadata].forEach(m => {
      if ('annotationId' in m) {
        stylableObjectIds.push((m as any).annotationId);
      }
    });

    const objectCollection = new AnnotationIdPointCloudObjectCollection(stylableObjectIds);
    const appearance = { color: new Color(0, 1, 0), visible: true };

    model.geometryNode.pointSize = 5;
    model.geometryNode.assignStyledPointCloudObjectCollection(
      new StyledPointCloudAnnotationVolumeCollection(objectCollection, appearance)
    );
    model.geometryNode.defaultAppearance = applyDefaultsToPointCloudAppearance({ visible: false });
    model.geometryNode.pointColorType = PointColorType.Height;

    return Promise.resolve();
  }
}
