/*!
 * Copyright 2025 Cognite AS
 */

import { ImageAnnotationObject } from './ImageAnnotationObject';
import { Matrix4 } from 'three';
import {
  AnnotationsBoundingBox,
  AnnotationsInstanceRef,
  AnnotationsTypesImagesInstanceLink,
  AnnotationsTypesPrimitivesGeometry2DGeometry
} from '@cognite/sdk';
import { ClassicDataSourceType } from '@reveal/data-providers';
import { isAnnotationInstanceLink } from './typeGuards';

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

  const annotationModelMock: ClassicDataSourceType['image360AnnotationType'] = {
    id: 1,
    annotationType: 'images.InstanceLink',
    data: annotationInstanceLink,
    annotatedResourceId: 123,
    annotatedResourceType: 'file',
    createdTime: new Date('2025-01-01'),
    lastUpdatedTime: new Date('2025-01-02'),
    status: 'approved',
    creatingApp: 'test-app',
    creatingAppVersion: '1.0',
    creatingUser: 'test-user'
  };

  describe('isAnnotationInstanceLink', () => {
    test('returns true for valid InstanceLink annotation', () => {
      const annotationType = 'images.InstanceLink';

      const result = isAnnotationInstanceLink(annotationType, annotationInstanceLink);

      expect(result).toBe(true);
    });

    test('returns false for InstanceLink with missing text', () => {
      const mockannotationInstanceLinkMissingText = {
        textRegion: annotationTextRegionMock,
        instanceRef: annotationInstanceRefMock
      };
      const annotationType = 'images.InstanceLink';

      const result = isAnnotationInstanceLink(annotationType, mockannotationInstanceLinkMissingText);

      expect(result).toBe(false);
    });

    test('returns false for InstanceLink with missing textRegion', () => {
      const mockAnnotationInstanceLinkMissingTextRegion = {
        text: annotationText,
        instanceRef: annotationInstanceRefMock
      };
      const annotationType = 'images.InstanceLink';

      const result = isAnnotationInstanceLink(annotationType, mockAnnotationInstanceLinkMissingTextRegion);

      expect(result).toBe(false);
    });

    test('returns false for wrong annotation type', () => {
      const annotationType = 'images.AssetLink';

      const result = isAnnotationInstanceLink(annotationType, annotationInstanceLink);

      expect(result).toBe(false);
    });
  });

  describe('createInstanceLinkAnnotationData', () => {
    test('creates PolygonAnnotationGeometryData when objectRegion has polygon for instance link', () => {
      const instanceLink: AnnotationsTypesImagesInstanceLink = {
        text: annotationText,
        textRegion: annotationTextRegionMock,
        objectRegion: objectRegionPolygonMock,
        instanceRef: annotationInstanceRefMock
      };

      const annotation: ClassicDataSourceType['image360AnnotationType'] = {
        ...annotationModelMock,
        data: instanceLink
      };

      const result = ImageAnnotationObject.createAnnotationObject(annotation, 'front', mockVisualizationBoxTransform);

      expect(result).toBeInstanceOf(ImageAnnotationObject);
    });

    test('creates BoxAnnotationGeometryData when objectRegion has boundingBox for instance link', () => {
      const instanceLink: AnnotationsTypesImagesInstanceLink = {
        text: annotationText,
        textRegion: annotationTextRegionMock,
        objectRegion: objectRegionBoundingBoxMock,
        instanceRef: annotationInstanceRefMock
      };

      const annotation: ClassicDataSourceType['image360AnnotationType'] = {
        ...annotationModelMock,
        data: instanceLink
      };

      const result = ImageAnnotationObject.createAnnotationObject(annotation, 'front', mockVisualizationBoxTransform);

      expect(result).toBeInstanceOf(ImageAnnotationObject);
    });

    test('uses textRegion as fallback when objectRegion is empty for instance link', () => {
      const instanceLink: AnnotationsTypesImagesInstanceLink = {
        text: annotationText,
        textRegion: annotationTextRegionMock,
        objectRegion: undefined,
        instanceRef: annotationInstanceRefMock
      };

      const annotation: ClassicDataSourceType['image360AnnotationType'] = {
        ...annotationModelMock,
        data: instanceLink
      };

      const result = ImageAnnotationObject.createAnnotationObject<ClassicDataSourceType>(
        annotation,
        'front',
        mockVisualizationBoxTransform
      );

      expect(result).toBeInstanceOf(ImageAnnotationObject);
    });
  });
});
