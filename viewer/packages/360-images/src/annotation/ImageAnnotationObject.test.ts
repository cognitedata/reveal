/*!
 * Copyright 2025 Cognite AS
 */

import { Matrix4 } from 'three';
import {
  AnnotationsBoundingBox,
  AnnotationsInstanceRef,
  AnnotationsTypesImagesInstanceLink,
  AnnotationsTypesPrimitivesGeometry2DGeometry
} from '@cognite/sdk';
import { ClassicDataSourceType } from '@reveal/data-providers';
import { createAnnotationModel } from '../../../../test-utilities';
import { ImageAnnotationObject } from './ImageAnnotationObject';

describe(ImageAnnotationObject.name, () => {
  const mockVisualizationBoxTransform = new Matrix4().identity();

  const annotationText = 'Test instance';
  const annotationTextRegionMock: AnnotationsBoundingBox = {
    xMin: 0.1,
    xMax: 0.3,
    yMin: 0.2,
    yMax: 0.4
  };
  const annotationInstanceRefMock: AnnotationsInstanceRef = {
    space: 'test-space',
    externalId: 'test-instance',
    instanceType: 'node' as const,
    sources: []
  };
  const objectRegionBoundingBoxMock: AnnotationsTypesPrimitivesGeometry2DGeometry = {
    boundingBox: {
      xMin: 0.15,
      xMax: 0.25,
      yMin: 0.15,
      yMax: 0.25
    }
  };

  const objectRegionPolygonMock: AnnotationsTypesPrimitivesGeometry2DGeometry = {
    polygon: {
      vertices: [
        { x: 0.1, y: 0.1 },
        { x: 0.3, y: 0.1 },
        { x: 0.3, y: 0.3 },
        { x: 0.1, y: 0.3 }
      ]
    }
  };

  const annotationInstanceLink: AnnotationsTypesImagesInstanceLink = {
    text: annotationText,
    textRegion: annotationTextRegionMock,
    instanceRef: annotationInstanceRefMock
  };

  const annotationInstanceLinkMock = createAnnotationModel({
    annotationType: 'images.InstanceLink',
    data: annotationInstanceLink
  });
  describe('createInstanceLinkAnnotationData', () => {
    test('creates PolygonAnnotationGeometryData when objectRegion has polygon for instance link and check if the object exists', () => {
      const instanceLink: AnnotationsTypesImagesInstanceLink = {
        text: annotationText,
        textRegion: annotationTextRegionMock,
        objectRegion: objectRegionPolygonMock,
        instanceRef: annotationInstanceRefMock
      };

      const annotation: ClassicDataSourceType['image360AnnotationType'] = {
        ...annotationInstanceLinkMock,
        data: instanceLink
      };

      const result = ImageAnnotationObject.createAnnotationObject(annotation, 'front', mockVisualizationBoxTransform);

      expect(result).toBeInstanceOf(ImageAnnotationObject);
      expect(result?.getObject().children.length).toEqual(2);
    });

    test('creates BoxAnnotationGeometryData when objectRegion has boundingBox for instance link', () => {
      const instanceLink: AnnotationsTypesImagesInstanceLink = {
        text: annotationText,
        textRegion: annotationTextRegionMock,
        objectRegion: objectRegionBoundingBoxMock,
        instanceRef: annotationInstanceRefMock
      };

      const annotation: ClassicDataSourceType['image360AnnotationType'] = {
        ...annotationInstanceLinkMock,
        data: instanceLink
      };

      const result = ImageAnnotationObject.createAnnotationObject(annotation, 'front', mockVisualizationBoxTransform);

      expect(result).toBeInstanceOf(ImageAnnotationObject);
      expect(result?.getObject().children.length).toEqual(2);
    });

    test('uses textRegion as fallback when objectRegion is empty for instance link', () => {
      const instanceLink: AnnotationsTypesImagesInstanceLink = {
        text: annotationText,
        textRegion: annotationTextRegionMock,
        objectRegion: undefined,
        instanceRef: annotationInstanceRefMock
      };

      const annotation: ClassicDataSourceType['image360AnnotationType'] = {
        ...annotationInstanceLinkMock,
        data: instanceLink
      };

      const result = ImageAnnotationObject.createAnnotationObject<ClassicDataSourceType>(
        annotation,
        'front',
        mockVisualizationBoxTransform
      );

      expect(result).toBeInstanceOf(ImageAnnotationObject);
      expect(result?.getObject().children.length).toEqual(2);
    });
  });
});
