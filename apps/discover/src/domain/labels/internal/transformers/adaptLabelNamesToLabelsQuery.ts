import isEmpty from 'lodash/isEmpty';

export const adaptLabelNamesToLabelsQuery = (labelNames?: string[]) => {
  if (labelNames === undefined || isEmpty(labelNames)) {
    return undefined;
  }

  const adaptToLabelsQuery = labelNames?.map((name) => ({
    filter: { name },
  }));

  return adaptToLabelsQuery;
};
