import { AnnotationType } from '@cognite/unified-file-viewer';
import { v4 as uuid } from 'uuid';
import { ANNOTATION_SOURCE_KEY } from '../constants';
import { AnnotationSource, ExtendedAnnotation } from '../types/annotations';

export const getExtendedAnnotationFixture = (): ExtendedAnnotation => {
  return {
    id: uuid(),
    containerId: '123',
    type: AnnotationType.RECTANGLE,
    metadata: {
      [ANNOTATION_SOURCE_KEY]: AnnotationSource.ANNOTATIONS,
      id: 123,
      annotationType: 'diagrams.AssetLink',
      annotatedResourceType: 'file',
      annotatedResourceId: 123456789,
      data: {
        text: '23-KA-9101',
        textRegion: {
          xMax: 0.11852449103003426,
          xMin: 0.06551098568836929,
          yMax: 0.6778791334093502,
          yMin: 0.6733181299885975,
        },
        assetRef: {
          externalId: '3047932288982463',
        },
      },
      status: 'approved',
      creatingApp: 'migrations',
      creatingAppVersion: '1.0.0',
      createdTime: new Date(1597233855648),
      lastUpdatedTime: new Date(1597233855648),
      creatingUser: 'nabati',
    },
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
};
