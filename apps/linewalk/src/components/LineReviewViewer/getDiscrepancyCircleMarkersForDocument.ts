/* eslint-disable no-underscore-dangle */

import { Drawing } from '@cognite/ornate';
import head from 'lodash/head';
import sortBy from 'lodash/sortBy';

import { Document } from '../../modules/lineReviews/types';
import isNotUndefined from '../../utils/isNotUndefined';

import getAnnotationsByDocument from './getAnnotationsByDocument';
import { Discrepancy } from './LineReviewViewer';
import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import { SHAMEFUL_SLIDE_HEIGHT, SLIDE_WIDTH } from './ReactOrnate';

const RADIUS = 10;
const getDiscrepancyCircleMarkersForDocument = (
  document: Document,
  discrepancies: Discrepancy[],
  onMarkerClick?: (discrepancy: Discrepancy) => void
): Drawing[] => {
  return discrepancies
    .map((discrepancy, index) => ({
      discrepancy,
      boundingBox: head(
        sortBy(
          getAnnotationsByDocument(document)
            .filter(({ id }) => discrepancy.ids.includes(id))
            .map(
              (d) =>
                mapPathToNewCoordinateSystem(
                  document._annotations.viewBox,
                  d.svgRepresentation.boundingBox,
                  { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
                ),
              ({ y }: { y: number }) => y
            )
        )
      ),
      number: index + 1,
    }))
    .filter(({ boundingBox }) => isNotUndefined(boundingBox))
    .map(({ discrepancy, boundingBox, number }, index) => ({
      groupId: document.id,
      id: `circle-marker-${index}`,
      type: 'circleMarker',
      onClick: () => onMarkerClick?.(discrepancy),
      attrs: {
        id: `circle-marker-${index}`,
        draggable: false,
        unselectable: true,
        pinnedTo: {
          x: boundingBox!.x + boundingBox!.scale.x / 2,
          y: boundingBox!.y,
        },
        radius: RADIUS,
        color: '#CF1A17',
        number,
      },
    }));
};

export default getDiscrepancyCircleMarkersForDocument;
