import { Classifier } from '@cognite/sdk-playground';

export const isClassifierTraining = (data?: Classifier) => {
  if (!data) return false;

  return data.status === 'queuing' || data.status === 'training';
};

export const isClassifierDone = (data?: Classifier) => {
  if (!data) return false;

  return data.status === 'failed' || data.status === 'finished';
};
