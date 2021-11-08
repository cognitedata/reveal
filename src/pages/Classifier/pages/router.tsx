import { useClassifierCurrentState } from 'machines/classifier/selectors/useClassifierSelectors';
import { ClassifierState } from 'machines/classifier/types';
import React, { FC } from 'react';
import { ManageTrainingSets } from './ManageTrainingSet/ManageTrainingSet';
import { ReviewModel } from './ReviewModel/ReviewModel';

export const ClassifierRouter: FC = () => {
  const classifierState = useClassifierCurrentState();

  switch (classifierState) {
    case ClassifierState.MANAGE:
      return <ManageTrainingSets />;
    case ClassifierState.TRAIN:
      return <p>train</p>;
    case ClassifierState.DEPLOY:
      return <ReviewModel />;
    default:
      return null;
  }
};
