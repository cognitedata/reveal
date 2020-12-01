import { Timeseries, TimeseriesSearchFilter } from '@cognite/sdk';
import client from 'services/CogniteSDK';
import useSearch from 'hooks/useSearch';

export default () => {
  return useSearch<Timeseries, TimeseriesSearchFilter>((params) =>
    client.timeseries.search(params).then((items) => ({ items }))
  );
};
