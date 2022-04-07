import { Drawing } from '@cognite/ornate';
import { KonvaEventObject } from 'konva/lib/Node';

import { ParsedDocument } from '../../modules/lineReviews/types';

import getAnnotationsForLineByDocument from './getAnnotationsForLineByDocument';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import padBoundingBoxByPixels from './padBoundingBoxByPixels';
import { SHAMEFUL_SLIDE_HEIGHT, SLIDE_WIDTH } from './ReactOrnate';

const getAnnotationBoundingBoxOverlay = (
  line: string | undefined,
  document: ParsedDocument,
  annotationIds: string[],
  prefix: string,
  {
    padding,
    ...options
  }: {
    padding?: number;
    stroke?: string;
    dash?: [number, number];
    strokeWidth?: number;
    fill?: string;
  },
  onClick?:
    | ((event: KonvaEventObject<MouseEvent>, pathId: string) => void)
    | undefined,
  onMouseOver?:
    | ((event: KonvaEventObject<MouseEvent>, pathId: string) => void)
    | undefined,
  onMouseOut?:
    | ((event: KonvaEventObject<MouseEvent>, pathId: string) => void)
    | undefined
): Drawing[] => {
  return getAnnotationsForLineByDocument(line, document)
    .filter(({ id }) => annotationIds.includes(id))
    .map((annotation) => ({
      groupId: getKonvaSelectorSlugByExternalId(document.externalId),
      id: `${prefix}${annotation.id}`,
      type: 'rect',
      onClick: onClick ? (event) => onClick(event, annotation.id) : undefined,
      onMouseOver: onMouseOver
        ? (event) => onMouseOver(event, annotation.id)
        : undefined,
      onMouseOut: onMouseOut
        ? (event) => onMouseOut(event, annotation.id)
        : undefined,
      attrs: {
        ...options,
        id: `${prefix}${annotation.id}`,
        ...padBoundingBoxByPixels(
          mapPathToNewCoordinateSystem(
            document.viewBox,
            annotation.boundingBox,
            { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
          ),
          padding ?? 0
        ),
        strokeScaleEnabled: false,
        draggable: false,
        unselectable: true,
      },
    }));
};

export default getAnnotationBoundingBoxOverlay;
