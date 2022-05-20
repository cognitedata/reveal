import { Keypoint, KeypointCollection } from 'src/modules/Review/types';

const dummyKeypoint = (caption?: string): Keypoint => {
  return {
    caption: caption || 'center',
    order: '1',
    color: 'red',
  };
};
export const getDummyPredefinedKeypoint = (id: string): KeypointCollection => {
  return {
    id,
    collectionName: 'gauge',
    keypoints: [
      dummyKeypoint('left'),
      dummyKeypoint('center'),
      dummyKeypoint('right'),
    ],
  };
};
