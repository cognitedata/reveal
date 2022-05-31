import {
  getRandomColor,
  validNewKeypoint,
  validNewShapes,
} from 'src/modules/Review/Components/AnnotationSettingsModal/AnnotationSettingsUtils';
import { NewKeypoints } from 'src/modules/Review/Components/AnnotationSettingsModal/types';
import { PredefinedShape } from 'src/modules/Review/types';

describe('Test getRandomColor', () => {
  const HEX_COLOR_CODE_REGEX = /^((0x){0,1}|#{0,1})([0-9a-f]{8}|[0-9a-f]{6})$/g;

  it('should return a valid color when called', () => {
    expect(getRandomColor()).toMatch(HEX_COLOR_CODE_REGEX);
  });
});

describe('Test validNewKeypoints function to validate new keypoint collections', () => {
  const isEmpty: NewKeypoints = {
    collectionName: '',
    keypoints: [{ caption: 'one', color: '#343434' }],
  };
  const isZero: NewKeypoints = {
    collectionName: '0',
    keypoints: [{ caption: 'one', color: '#343434' }],
  };
  const validName: NewKeypoints = {
    collectionName: ' test-kp-6 ',
    keypoints: [{ caption: 'one', color: '#343434' }],
  };

  const zeroKeypoints: NewKeypoints = {
    collectionName: ' test-kp-6 ',
    keypoints: [],
  };
  const keypointWithEmptyCaption: NewKeypoints = {
    collectionName: ' test-kp-6 ',
    keypoints: [
      { caption: 'one', color: '#343434' },
      { caption: '', color: '#343434' },
    ],
  };
  const keypointWithEmptyColor: NewKeypoints = {
    collectionName: ' test-kp-6 ',
    keypoints: [
      { caption: 'one', color: '#343434' },
      { caption: 'two', color: '' },
    ],
  };
  it('should return false if collections are empty', () => {
    expect(validNewKeypoint(undefined)).toEqual(false);
  });
  it('should return false for  collections with empty collection name', () => {
    expect(validNewKeypoint(isEmpty)).toEqual(false);
  });
  it('should return true for collections with valid collection names', () => {
    expect(validNewKeypoint(isZero)).toEqual(true);
    expect(validNewKeypoint(validName)).toEqual(true);
  });
  it('should return false for collections with 0 keypoints', () => {
    expect(validNewKeypoint(zeroKeypoints)).toEqual(false);
  });
  it('should return false for collections with empty keypoint caption', () => {
    expect(validNewKeypoint(keypointWithEmptyCaption)).toEqual(false);
  });
  it('should return false for collections with empty keypoint color', () => {
    expect(validNewKeypoint(keypointWithEmptyColor)).toEqual(false);
  });
});

describe('Test validNewShapes function to validate new shapes', () => {
  const isEmpty: { [key: string]: PredefinedShape } = {
    '': {
      shapeName: '',
      color: '#343434',
    },
  };
  const isZero: { [key: string]: PredefinedShape } = {
    '0': {
      shapeName: '0',
      color: '#343434',
    },
  };
  const validName: { [key: string]: PredefinedShape } = {
    ' test- kp - 2 ': {
      shapeName: ' test- kp - 2 ',
      color: '#343434',
    },
  };

  const withoutColor: { [key: string]: PredefinedShape } = {
    ' test- kp - 2 ': {
      shapeName: ' test- kp - 2 ',
      color: '',
    },
  };

  it('should return false if shapes are empty', () => {
    expect(validNewShapes({})).toEqual(false);
  });
  it('should return false if shape name is empty', () => {
    expect(validNewShapes(isEmpty)).toEqual(false);
  });
  it('should return true for shapes with valid names', () => {
    expect(validNewShapes(isZero)).toEqual(true);
    expect(validNewShapes(validName)).toEqual(true);
  });
  it('should return false if shape color is empty', () => {
    expect(validNewShapes(withoutColor)).toEqual(false);
  });
});
