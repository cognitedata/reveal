import { Timeseries } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { isNumeric } from '../../../../utils/number';

const getTimeseriesId = (id: string | number) => {
  if (typeof id === 'number' || isNumeric(id)) {
    return { id: Number(id) };
  }

  return { externalId: id };
};

export const useTimeseriesByIdQuery = (id?: string | number) => {
  return useCdfItem<Timeseries>('timeseries', getTimeseriesId(id!), {
    enabled: id !== undefined,
  });
};
