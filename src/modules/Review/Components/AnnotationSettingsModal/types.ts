import { KeypointCollection } from 'src/modules/Review/types';

export type NewKeypoints = Pick<
  KeypointCollection,
  'collectionName' | 'lastUpdated'
> & {
  keypoints: {
    caption: string;
    color: string;
  }[];
};
