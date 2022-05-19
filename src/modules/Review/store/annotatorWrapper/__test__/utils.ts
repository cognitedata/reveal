import { Keypoint, KeypointCollection } from 'src/modules/Review/types';

const dummyKeypoint = (): Keypoint => {
  return {
    caption: 'center',
    order: '1',
    color: 'red',
  };
};
export const getDummyPredefinedKeypoint = (id: string): KeypointCollection => {
  return {
    id,
    collectionName: 'gauge',
    keypoints: [dummyKeypoint()],
  };
};
