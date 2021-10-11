import { useSelector } from 'react-redux';

import { StoreState } from 'core';

import { FeedbackState } from 'modules/feedback/types';

export const useFeedback = () => {
  return useSelector<StoreState, FeedbackState>((state) => state.feedback);
};

export const useCrowdSourcing = () => {
  return useSelector((state: StoreState) => state.crowdsourcing);
};
