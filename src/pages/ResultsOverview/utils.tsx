import {
  CURRENT_VERSION,
  PendingCogniteAnnotation,
} from '@cognite/annotations';

export const stubAnnotation = {
  label: 'sample',
  source: 'job:0',
  version: CURRENT_VERSION,
  status: 'unhandled',
  box: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
} as PendingCogniteAnnotation;
