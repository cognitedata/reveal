import { BoundingBox } from '../../modules/lineReviews/types';

const padBoundingBoxByPixels = (boundingBox: BoundingBox, pixels: number) => {
  return {
    ...boundingBox,
    x: boundingBox.x - pixels,
    width: boundingBox.width + pixels * 2,
    y: boundingBox.y - pixels,
    height: boundingBox.height + pixels * 2,
  };
};

export default padBoundingBoxByPixels;
