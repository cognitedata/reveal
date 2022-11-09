import { FileInfo } from '@cognite/sdk/dist/src';
import { RectangleAnnotation } from '@cognite/unified-file-viewer';
import { ProposedCogniteAnnotation } from './types';
import { CURRENT_VERSION } from '@cognite/annotations';

const getCogniteAnnotationFromUfvAnnotation = (
  annotation: RectangleAnnotation,
  file: FileInfo,
  page: number
): ProposedCogniteAnnotation => ({
  /**
   * The fields here are populated based off of what the the old FilePreview component was passing
   * along. This can be refactored away at some point.
   */
  id: annotation.id,
  status: 'verified',
  version: CURRENT_VERSION,
  page,
  label: '',
  type: '',
  source: 'data-exploration-components',
  box: {
    xMin: annotation.x,
    yMin: annotation.y,
    xMax: annotation.x + annotation.width,
    yMax: annotation.y + annotation.height,
  },
  // The logic of setting the fileExternalId / fileId is coming from old react-picture-annotations
  fileExternalId: file.externalId,
  fileId: file.externalId === undefined ? file.id : undefined,
});

export default getCogniteAnnotationFromUfvAnnotation;
