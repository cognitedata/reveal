import { NewKeypoints } from 'src/modules/Review/Components/AnnotationSettingsModal/types';
import { Shape } from 'src/modules/Review/types';

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
    if (collectionName === '') return false;

    const keypointCaptions = keypoints.map((keypoint) => keypoint.caption);
    if (keypointCaptions.includes('')) return false;
  }
  return true;
};

export const validNewShapes = (newShapes: { [key: string]: Shape }) => {
  const shapeNames = Object.keys(newShapes).map(
    (key) => newShapes[key].shapeName
  );
  return !shapeNames.includes('');
};
