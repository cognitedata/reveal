import React, { FC } from 'react';
import { useClassifierCurrentState } from '../../../machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from '../../../machines/classifier/types';

import { ManageTrainingSets } from './ManageTrainingSet';
import { ReviewModel } from './ReviewModel/ReviewModel';
import TrainClassifier from './TrainClassifier/TrainClassifier';

export interface ClassifierProps {
  Widget: () => JSX.Element | JSX.Element[];
}
export const ClassifierRouter: FC<ClassifierProps> = ({ Widget }) => {
  const classifierState = useClassifierCurrentState();

  switch (classifierState) {
    case ClassifierState.MANAGE:
      return <ManageTrainingSets Widget={Widget} />;
    case ClassifierState.TRAIN:
      return <TrainClassifier Widget={Widget} />;
    case ClassifierState.DEPLOY:
      return <ReviewModel Widget={Widget} />;
    default:
      return null;
  }
};
