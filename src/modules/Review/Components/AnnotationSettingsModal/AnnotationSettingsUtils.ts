import { NewKeypoints } from 'src/modules/Review/Components/AnnotationSettingsModal/types';
import { PredefinedShape } from 'src/modules/Review/types';
import isEmpty from 'lodash/isEmpty';

const hsvToRgb = (h: number, s: number, v: number) => {
  let r = 0;
  let g = 0;
  let b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('')}`;

export const getRandomColor = () => {
  const goldenRatioConjugate = 0.618033988749895;
  const h = (Math.random() * 255 + goldenRatioConjugate) % 1;
  const [r, g, b] = hsvToRgb(h, 0.5, 0.95);
  return rgbToHex(r, g, b);
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

export const validNewShapes = (newShapes: {
  [key: string]: PredefinedShape;
}) => {
  if (isEmpty(newShapes)) {
    return false;
  }
  const shapeNames = Object.keys(newShapes).map(
    (key) => newShapes[key].shapeName
  );
  const shapeColors = Object.keys(newShapes).map((key) => newShapes[key].color);
  return !shapeNames.includes('') && !shapeColors.includes('');
};
