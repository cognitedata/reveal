import { PredictionObject } from 'hooks/contextualization-api';
import { styleScope } from 'styles/styleScope';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const sleep = async (ms: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

export const formatPredictionObject = (o: PredictionObject): string => {
  return o.name || o.description || o.externalId || o.id.toString();
};
