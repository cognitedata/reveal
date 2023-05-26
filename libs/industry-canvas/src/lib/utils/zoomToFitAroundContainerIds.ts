import { UnifiedViewer } from '@cognite/unified-file-viewer';

import { ZOOM_TO_FIT_MARGIN } from '../constants';

import { isNotUndefined } from './isNotUndefined';

type IRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
const mergeBoundingBoxes = (boundingBoxes: IRect[]): IRect | undefined => {
  if (boundingBoxes.length === 0) {
    return undefined;
  }

  const xMin = Math.min(...boundingBoxes.map((bb) => bb.x));
  const yMin = Math.min(...boundingBoxes.map((bb) => bb.y));
  const xMax = Math.max(...boundingBoxes.map((bb) => bb.x + bb.width));
  const yMax = Math.max(...boundingBoxes.map((bb) => bb.y + bb.height));

  return {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
};

const addRelativeMargin = (rect: IRect, margin: number): IRect => {
  const xMargin = rect.width * margin;
  const yMargin = rect.height * margin;

  return {
    x: rect.x - xMargin,
    y: rect.y - yMargin,
    width: rect.width + xMargin * 2,
    height: rect.height + yMargin * 2,
  };
};

export const zoomToFitAroundContainerIds = ({
  unifiedViewer,
  containerIds,
}: {
  unifiedViewer: UnifiedViewer;
  containerIds: string[];
}): void => {
  const boundingBox = mergeBoundingBoxes(
    containerIds
      .map((id) => unifiedViewer.getContainerRectRelativeToStageById(id))
      .filter(isNotUndefined)
  );
  if (boundingBox === undefined) {
    return;
  }

  const boundingBoxWithMargin = addRelativeMargin(
    boundingBox,
    ZOOM_TO_FIT_MARGIN
  );

  unifiedViewer.setViewport(
    {
      x: boundingBoxWithMargin.x + boundingBoxWithMargin.width / 2,
      y: boundingBoxWithMargin.y + boundingBoxWithMargin.height / 2,
      width: boundingBoxWithMargin.width,
      height: boundingBoxWithMargin.height,
    },
    {
      duration: 0.2,
    }
  );
};
