import { useClassifierCurrentState } from 'src/machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'src/machines/classifier/types';
import React, { FC } from 'react';
import { ManageTrainingSets } from './ManageTrainingSet/ManageTrainingSet';
import TrainClassifier from './TrainClassifier/TrainClassifier';
import { ReviewModel } from './ReviewModel/ReviewModel';

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
