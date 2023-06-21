import { PredefinedKeypoint } from 'src/modules/Review/types';

/**
 * This populates predefined keypoints with correct colors
 *
 * Since predefined keypoints created before june 2022 each of them could have different color property
 * within same collection
 */
export const getPredefinedKeypointsWithColor = (
  keypoints?: PredefinedKeypoint[],
  color?: string
) => {
  if (keypoints && keypoints.length) {
    const keypointColor = color || keypoints[0].color;
    return keypoints.map((predefinedKeypoint) => ({
      ...predefinedKeypoint,
      color: keypointColor,
    }));
  }
  return keypoints;
};
