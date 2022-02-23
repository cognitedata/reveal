import { Badge, Input } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import NoData from 'components/utils/NoData';
import Loading from 'components/utils/Loading';
import useTimeSeriesSearchQuery from 'hooks/useQuery/useTimeSeriesSearchQuery';
import usePagination from 'hooks/usePagination';
import useTimeSeriesAggregateQuery from 'hooks/useQuery/useTimeSeriesAggregateQuery';

import TimeSeriesRow from '../TimeSeriesRow';
import { RowWrapper } from '../TimeSeriesRow/RowWrapper';
import TimeSeriesSidebar from '../TimeSeriesSidebar';

import { TabWrapper } from './elements';

export type TimeSeriesTabProps = {
  assetId: number;
};

const TimeSeriesTab = ({ assetId }: TimeSeriesTabProps) => {
  // The actual value of the input field
  const [value, setValue] = useState('');
  // The field we pass to the query (so we can debounce)
  const [query, setQuery] = useState('');
  const { renderPagination, getPageData, resetPages } = usePagination();
  const [selectedTimeSeries, setSelectedTimeSeries] = useState();
  const debouncedSetQuery = useMemo(() => debounce(setQuery, 300), []);

  const { data: totalTimeSeriesOnAsset } = useTimeSeriesAggregateQuery({
    filter: {
      assetIds: [assetId],
    },
  });
  const { data: totalTimeSeriesUnderAsset } = useTimeSeriesAggregateQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
  });

  const assetQuery = useTimeSeriesSearchQuery({
    filter: {
      assetIds: [assetId],
    },
    search: {
      name: query || undefined,
    },
    limit: 500,
  });
  const relatedQuery = useTimeSeriesSearchQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
    search: {
      name: query || undefined,
    },
    limit: 500,
  });

  useEffect(() => {
    resetPages();
  }, [relatedQuery.data, assetQuery.data]);

  const renderSection = (
    { data, isLoading }: UseQueryResult<Timeseries[], unknown>,
    name: string
  ) => {
    if (isLoading) {
      return <Loading />;
    }
    if (!data || data.length === 0) {
      return <NoData type="Timeseries" />;
    }

    return (
      <RowWrapper>
        {getPageData(data, name).map((timeSeries) => (
          <TimeSeriesRow
            key={timeSeries.id}
            timeSeries={timeSeries}
            onClick={() => {
              setSelectedTimeSeries(timeSeries);
            }}
          />
        ))}
        {renderPagination({ name, total: data.length })}
      </RowWrapper>
    );
  };
  return (
    <TabWrapper style={{ paddingRight: selectedTimeSeries ? 280 : 0 }}>
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
          On this asset{' '}
          <Badge
            text={String(
              (query ? assetQuery.data?.length : totalTimeSeriesOnAsset) || 0
            )}
          />
        </h3>
        {renderSection(assetQuery, 'thisAsset')}
      </section>
      <section>
        <h3>
          Related time series{' '}
          <Badge
            text={String(
              (query ? relatedQuery.data?.length : totalTimeSeriesUnderAsset) ||
                0
            )}
          />
        </h3>
        {renderSection(relatedQuery, 'relatedAssets')}
      </section>
      {selectedTimeSeries && (
        <div className="sidebar">
          <TimeSeriesSidebar timeSeries={selectedTimeSeries} />
        </div>
      )}
    </TabWrapper>
  );
};

export default TimeSeriesTab;
