import { CogniteClient, StringDatapoint, StringDatapoints } from '@cognite/sdk';

import head from 'lodash/head';

import { StringDatapointsQuery } from '../types';

export const getTimeseriesStringDatapoints = (
  sdk: CogniteClient,
  query: StringDatapointsQuery
): Promise<StringDatapoint[]> => {
  const { timeseriesId, ...rest } = query;

  return sdk.datapoints
    .retrieve({
      items: [{ id: timeseriesId }],
      ...rest,
    })
    .then((items) => {
      return head(items as StringDatapoints[])?.datapoints || [];
    });
};
