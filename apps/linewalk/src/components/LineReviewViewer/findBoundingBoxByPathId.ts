import { ParsedDocument } from '../../modules/lineReviews/types';

import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import { SHAMEFUL_SLIDE_HEIGHT, SLIDE_WIDTH } from './ReactOrnate';

const findBoundingBoxByPathId = (document: ParsedDocument, pathId: string) => {
  const datum = document.annotations.find(({ id }) => id === pathId);

  if (!datum) {
    return undefined;
  }

  return mapPathToNewCoordinateSystem(document.viewBox, datum.boundingBox, {
    width: SLIDE_WIDTH,
    height: SHAMEFUL_SLIDE_HEIGHT,
  });
};

export default findBoundingBoxByPathId;
