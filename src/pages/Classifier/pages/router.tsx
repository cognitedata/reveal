import { useClassifierCurrentState } from 'machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'machines/classifier/types';
import React, { FC } from 'react';
import { ManageTrainingSets } from './ManageTrainingSet/ManageTrainingSet';
import TrainClassifier from './TrainClassifier/TrainClassifier';
import { ReviewModel } from './ReviewModel/ReviewModel';

export const ClassifierRouter: FC = () => {
  const classifierState = useClassifierCurrentState();

  switch (classifierState) {
    case ClassifierState.MANAGE:
      return <ManageTrainingSets />;
    case ClassifierState.TRAIN:
      return <TrainClassifier />;
    case ClassifierState.DEPLOY:
      return <ReviewModel />;
    default:
      return null;
  }
};
