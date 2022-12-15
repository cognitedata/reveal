import { CURRENT_VERSION } from '@cognite/annotations';
import { AnnotationType } from '@cognite/unified-file-viewer';
import { v4 as uuid } from 'uuid';
import {
  ANNOTATION_SOURCE_KEY,
  AnnotationSource,
  ExtendedAnnotation,
} from 'containers/Files/FilePreview/FilePreviewUFV/types';
import { PNID_ANNOTATION_TYPE } from 'utils';

export const getExtendedAnnotationFixture = (): ExtendedAnnotation => {
  return {
    id: uuid(),
    containerId: '123',
    type: AnnotationType.RECTANGLE,
    metadata: {
      [ANNOTATION_SOURCE_KEY]: AnnotationSource.EVENTS,
      id: 123,
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
      status: 'verified',
      version: CURRENT_VERSION,
      source: `email:testing`,
      label: '',
      type: PNID_ANNOTATION_TYPE,
      page: 0,
      box: {
        xMin: 1,
        yMin: 1,
        xMax: 1,
        yMax: 1,
      },
    },
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
};
