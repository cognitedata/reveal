import { PredefinedKeypointCollection } from 'src/modules/Review/types';

export type NewKeypoints = Pick<
  PredefinedKeypointCollection,
  'collectionName' | 'lastUpdated' | 'color'
> & {
  keypoints: {
    caption: string;
    color: string;
  }[];
};
