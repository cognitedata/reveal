import { Drawing } from '@cognite/ornate';

import { ParsedDocument } from '../../modules/lineReviews/types';

import getAnnotationsForLineByDocument from './getAnnotationsForLineByDocument';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import { SHAMEFUL_SLIDE_HEIGHT, SLIDE_WIDTH } from './ReactOrnate';

const getAnnotationBoundingBoxOverlay = (
  line: string,
  document: ParsedDocument,
  annotationIds: string[],
  prefix: string,
  fill: string
): Drawing[] => {
  return getAnnotationsForLineByDocument(line, document)
    .filter(({ id }) => annotationIds.includes(id))
    .map((annotation) => ({
      groupId: getKonvaSelectorSlugByExternalId(document.externalId),
      id: `${prefix}-${annotation.id}`,
      type: 'rect',
      attrs: {
        id: `${prefix}-${annotation.id}`,
        ...mapPathToNewCoordinateSystem(
          document.viewBox,
          annotation.boundingBox,
          { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
        ),
        draggable: false,
        unselectable: true,
        fill,
      },
    }));
};

export default getAnnotationBoundingBoxOverlay;
