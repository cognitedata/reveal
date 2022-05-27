import { NewKeypoints } from 'src/modules/Review/Components/AnnotationSettingsModal/types';
import { LegacyShape } from 'src/modules/Review/types';
import isEmpty from 'lodash/isEmpty';

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const validNewKeypoint = (newKeypoints: NewKeypoints | undefined) => {
  if (newKeypoints) {
    const { collectionName, keypoints } = newKeypoints;
    if (isEmpty(collectionName)) return false;

    if (!keypoints.length) return false;
    const keypointCaptions = keypoints.map((keypoint) => keypoint.caption);
    if (keypointCaptions.includes('')) return false;
    const keypointColors = keypoints.map((keypoint) => keypoint.color);
    return !keypointColors.includes('');
  }
  return false;
};

export const validNewShapes = (newShapes: { [key: string]: LegacyShape }) => {
  if (isEmpty(newShapes)) {
    return false;
  }
  const shapeNames = Object.keys(newShapes).map(
    (key) => newShapes[key].shapeName
  );
  const shapeColors = Object.keys(newShapes).map((key) => newShapes[key].color);
  return !shapeNames.includes('') && !shapeColors.includes('');
};
