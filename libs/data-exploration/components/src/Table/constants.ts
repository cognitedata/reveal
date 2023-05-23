import { FileTypes } from '@data-exploration-lib/core';

export const ColumnKeys = [
  'created',
  'relation',
  'labels',
  'lastUpdatedTime',
  'parentExternalId',
  'isString',
  'isStep',
  'dataSet',
  'startTime',
  'endTime',
  'mimeType',
  'uploadedTime',
  'columns',
  'relationshipLabels',
] as const;

export const MAX_COLUMN_SELECTION = 20;

export const defaultVisibility = {
  [FileTypes.CAD_MOLDELS]: true,
  [FileTypes.POINT_CLOUDS]: true,
  [FileTypes.IMAGES_360]: true,
};
