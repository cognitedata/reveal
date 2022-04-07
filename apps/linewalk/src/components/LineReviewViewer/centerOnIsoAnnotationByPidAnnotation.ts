import { CogniteOrnate, Drawing } from '@cognite/ornate';
import Konva from 'konva';

import { ParsedDocument } from '../../modules/lineReviews/types';

import { BOUNDING_BOX_PADDING_PX } from './constants';
import flashDrawing from './flashDrawing';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import padBoundingBoxByPixels from './padBoundingBoxByPixels';
import { SHAMEFUL_SLIDE_HEIGHT, SLIDE_WIDTH } from './ReactOrnate';

const centerOnAnnotationByAnnotationId = (
  documents: ParsedDocument[],
  ornateRef: CogniteOrnate | undefined,
  annotationId: string
) => {
  if (!ornateRef) {
    console.log('ornateRef was not defined, exiting early');
    return;
  }

  const boundingBox = ornateRef.stage
    .findOne(`#${annotationId}`)
    ?.getClientRect({
      skipStroke: true,
      relativeTo: ornateRef.stage as unknown as Konva.Container,
    });

  if (!boundingBox) {
    console.log(
      'Could not find  for bounding box for annotation',
      annotationId
    );
    return;
  }

  ornateRef.zoomToLocation(
    {
      x: -(boundingBox.x + boundingBox.width / 2),
      y: -(boundingBox.y + boundingBox.height / 2),
    },
    0.7,
    1
  );

  const document = documents.find((document) =>
    document.annotations.some((annotation) => annotation.id === annotationId)
  );

  if (!document) {
    throw new Error('No document with such an annotation');
  }

  const annotation = document.annotations.find(
    (annotation) => annotation.id === annotationId
  );

  if (!annotation) {
    throw new Error('No such annotation');
  }

  const drawing: Drawing = {
    id: `flash-${annotation.id}`,
    type: 'rect',
    attrs: {
      id: `flash-${annotation.id}`,
      ...padBoundingBoxByPixels(
        mapPathToNewCoordinateSystem(document.viewBox, annotation.boundingBox, {
          width: SLIDE_WIDTH,
          height: SHAMEFUL_SLIDE_HEIGHT,
        }),
        BOUNDING_BOX_PADDING_PX
      ),
      x: boundingBox.x,
      y: boundingBox.y,
      strokeWidth: 6,
      dash: [1, 1],
      draggable: false,
      unselectable: true,
      lineJoin: 'bevel',
      stroke: 'blue',
      inGroup: getKonvaSelectorSlugByExternalId(document.externalId),
    },
  };

  if (ornateRef) {
    flashDrawing(ornateRef, drawing);
  }
};

export default centerOnAnnotationByAnnotationId;
