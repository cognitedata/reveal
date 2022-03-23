import { Drawing } from '@cognite/ornate';
import { KonvaEventObject } from 'konva/lib/Node';

import { ParsedDocument } from '../../modules/lineReviews/types';

import getAnnotationsForLineByDocument from './getAnnotationsForLineByDocument';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import { SHAMEFUL_SLIDE_HEIGHT, SLIDE_WIDTH } from './ReactOrnate';

const getAnnotationOverlay = (
  line: string | undefined,
  document: ParsedDocument,
  annotationIds: string[],
  prefix: string,
  options: {
    stroke?: string;
    dash?: [number, number];
    strokeWidth?: number;
  },
  onClick?:
    | ((event: KonvaEventObject<MouseEvent>, pathId: string) => void)
    | undefined
): Drawing[] => {
  return getAnnotationsForLineByDocument(line, document)
    .filter(({ id }) => annotationIds.includes(id))
    .map((annotation) => ({
      groupId: getKonvaSelectorSlugByExternalId(document.externalId),
      id: `${prefix}${annotation.id}`,
      type: 'path',
      onClick: onClick ? (event) => onClick(event, annotation.id) : undefined,
      attrs: {
        ...options,
        id: `${prefix}-${annotation.id}`,
        ...mapPathToNewCoordinateSystem(
          document.viewBox,
          annotation.boundingBox,
          { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT },
          annotation.svgPaths.map(({ svgCommands }) => svgCommands).join(' ')
        ),
        strokeScaleEnabled: false,
        draggable: false,
        unselectable: true,
      },
    }));
};

export default getAnnotationOverlay;
