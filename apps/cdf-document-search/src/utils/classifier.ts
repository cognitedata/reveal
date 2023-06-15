import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';

export const isClassifierTraining = (classifier?: Classifier) => {
  if (!classifier) return false;

  return classifier.status === 'queuing' || classifier.status === 'training';
};

export const isClassifierDone = (classifier?: Classifier) => {
  if (!classifier) return false;

  return classifier.status === 'failed' || classifier.status === 'finished';
};

export const isClassifierFinished = (classifier?: Classifier) => {
  if (!classifier) return false;

  return classifier.status === 'finished';
};
