import { Drawing } from '@cognite/ornate';

import { ParsedDocument } from '../../modules/lineReviews/types';

import getAnnotationsForLineByDocument from './getAnnotationsForLineByDocument';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import padBoundingBoxByPixels from './padBoundingBoxByPixels';
import { Group, SHAMEFUL_SLIDE_HEIGHT, SLIDE_WIDTH } from './ReactOrnate';

const getOpacityGroupByDocument = (
  line: string,
  document: ParsedDocument
): Group => {
  return {
    id: `opacity-group-${getKonvaSelectorSlugByExternalId(
      document.externalId
    )}`,
    groupId: `${getKonvaSelectorSlugByExternalId(document.externalId)}`,
    cached: true,
    type: 'group',
    drawings: [
      {
        id: `opacity-group-base-${getKonvaSelectorSlugByExternalId(
          document.externalId
        )}`,
        type: 'rect',
        attrs: {
          id: `opacity-group-base-${getKonvaSelectorSlugByExternalId(
            document.externalId
          )}`,
          x: 0,
          y: 0,
          width: SLIDE_WIDTH,
          height: SHAMEFUL_SLIDE_HEIGHT,
          fill: 'rgba(255,255,255,0.8)',
        },
      },
      ...getAnnotationsForLineByDocument(line, document).map<Drawing>(
        (annotation) => ({
          id: `opacity-${annotation.id}`,
          type: 'rect',
          attrs: {
            id: `opacity-${annotation.id}`,
            ...padBoundingBoxByPixels(
              mapPathToNewCoordinateSystem(
                document.viewBox,
                annotation.boundingBox,
                { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
              ),
              1
            ),
            unselectable: true,
            fill: 'white',
            globalCompositeOperation: 'destination-out',
          },
        })
      ),
    ],
  };
};

export default getOpacityGroupByDocument;
