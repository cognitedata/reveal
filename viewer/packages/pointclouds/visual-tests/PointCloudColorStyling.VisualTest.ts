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
import { ModelIdentifier } from '@reveal/modeldata-api';
import { PointCloudNode } from '../src/PointCloudNode';
import assert from 'assert';
import { AnnotationIdPointCloudObjectCollection } from '../src/styling/AnnotationListPointCloudObjectCollection';
import { StyledPointCloudObjectCollection } from '../src/styling/StyledPointCloudObjectCollection';

import { PotreePointColorType } from '../src/potree-three-loader';

class CustomAnnotationProvider implements IAnnotationProvider {

  async getAnnotations(_modelIdentifier: ModelIdentifier): Promise<PointCloudObjectAnnotationData> {
    const cdfAnnotations = [{ annotationId: 123,  region:
                              [ { shapeType: ShapeType.Cylinder, centerA: [-0.03, 0.1, -1000], centerB: [-0.03, 0.1, 1000], radius: 0.04 } ]
                            }]
    const annotationData = annotationsToObjectInfo(cdfAnnotations);

    return annotationData;
  }
}

export default class PointCloudColorStylingVisualTest extends StreamingVisualTestFixture {
  constructor() {
    super('pointcloud-bunny');
  }

  override createPointCloudFactory(): PointCloudFactory {
    return new PointCloudFactory(this.potreeInstance, new CustomAnnotationProvider());
  }

  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model } = testFixtureComponents;

    assert(model.geometryNode instanceof PointCloudNode);

    const stylableObjectIds: number[] = [];
    [...model.geometryNode.potreeNode.stylableObjectAnnotationIds].forEach(m => stylableObjectIds.push(m.annotationId));

    const objectCollection = new AnnotationIdPointCloudObjectCollection(stylableObjectIds);
    const appearance = { color: [0, 255, 0] as [number, number, number], visible: true };

    model.geometryNode.assignStyledPointCloudObjectCollection(
      new StyledPointCloudObjectCollection(objectCollection, appearance));

    model.geometryNode.pointColorType = PotreePointColorType.Height;

    return Promise.resolve();
  }
}
