import { Badge, Input } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import NoData from 'components/utils/NoData';
import Loading from 'components/utils/Loading';
import useTimeSeriesSearchQuery from 'hooks/useQuery/useTimeSeriesSearchQuery';

import TimeSeriesRow from '../TimeSeriesRow';
import { RowWrapper } from '../TimeSeriesRow/RowWrapper';

import { TabWrapper } from './elements';

export type TimeSeriesTabProps = {
  assetId: number;
};

const TimeSeriesTab = ({ assetId }: TimeSeriesTabProps) => {
  // The actual value of the input field
  const [value, setValue] = useState('');
  // The field we pass to the query (so we can debounce)
  const [query, setQuery] = useState('');
  const debouncedSetQuery = useMemo(() => debounce(setQuery, 300), []);

  const assetQuery = useTimeSeriesSearchQuery({
    filter: {
      assetIds: [assetId],
    },
    search: {
      name: query,
    },
    limit: 10,
  });
  const relatedQuery = useTimeSeriesSearchQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
    search: {
      name: query,
    },
    limit: 10,
  });

  const renderSection = ({
    data,
    isLoading,
  }: UseQueryResult<Timeseries[], unknown>) => {
    if (isLoading) {
      return <Loading />;
    }
    if (!data) {
      return <NoData type="Timeseries" />;
    }

    return (
      <RowWrapper>
        {data.map((timeSeries) => (
          <TimeSeriesRow key={timeSeries.id} timeSeries={timeSeries} />
        ))}
      </RowWrapper>
    );
  };
  return (
    <TabWrapper>
      <Input
        className="search-input"
        placeholder="Search"
        icon="Search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSetQuery(e.target.value);
        }}
      />
      <section>
        <h3>
          On this asset <Badge text={String(assetQuery.data?.length || 0)} />
        </h3>
        {renderSection(assetQuery)}
      </section>
      <section>
        <h3>
          Related assets <Badge text={String(relatedQuery.data?.length || 0)} />
        </h3>
        {renderSection(relatedQuery)}
      </section>
    </TabWrapper>
  );
};

export default TimeSeriesTab;
