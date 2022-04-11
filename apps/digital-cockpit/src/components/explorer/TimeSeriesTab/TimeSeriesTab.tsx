import { Badge } from '@cognite/cogs.js';
import { Timeseries, TimeseriesSearchFilter } from '@cognite/sdk';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import NoData from 'components/utils/NoData';
import Loading from 'components/utils/Loading';
import useTimeSeriesSearchQuery from 'hooks/useQuery/useTimeSeriesSearchQuery';
import usePagination from 'hooks/usePagination';
import useTimeSeriesAggregateQuery from 'hooks/useQuery/useTimeSeriesAggregateQuery';
import { InternalFilterSettings } from 'components/search/types';
import { mapFiltersToCDF } from 'components/search/utils';
import SearchBar from 'components/search/SearchBar';
import { useLocation } from 'react-router-dom';

import TimeSeriesRow from '../TimeSeriesRow';
import { RowWrapper } from '../TimeSeriesRow/RowWrapper';
import TimeSeriesSidebar from '../TimeSeriesSidebar';

import { TabWrapper } from './elements';
import { TIMESERIES_FILTER_SELECTORS } from './consts';

export type TimeSeriesTabProps = {
  assetId: number;
};

const TimeSeriesTab = ({ assetId }: TimeSeriesTabProps) => {
  // get search query from url
  const { search } = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(search), [search]);
  // The actual value of the input field
  const [filterValue, setFilterValue] = useState<InternalFilterSettings>({
    query: urlParams.get('q') || '',
    filters: [],
  });
  // The field we pass to the query (so we can debounce)
  const [filterQuery, setFilterQuery] = useState<TimeseriesSearchFilter>();
  const debouncedSetFilterQuery = useMemo(
    () =>
      debounce((query: InternalFilterSettings) => {
        setFilterQuery(mapFiltersToCDF(query, 'query'));
      }, 300),
    []
  );
  const { renderPagination, getPageData, resetPages } = usePagination();
  const [selectedTimeSeries, setSelectedTimeSeries] = useState();

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
    ...filterQuery,
    filter: {
      ...filterQuery?.filter,
      assetIds: [assetId],
    },
    limit: 500,
  });
  const relatedQuery = useTimeSeriesSearchQuery({
    ...filterQuery,
    filter: {
      ...filterQuery?.filter,
      assetSubtreeIds: [{ id: assetId }],
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
      <SearchBar
        value={filterValue}
        onChange={(next) => {
          setFilterValue(next);
          debouncedSetFilterQuery(next);
        }}
        selectors={TIMESERIES_FILTER_SELECTORS}
      />
      <section>
        <h3>
          On this asset{' '}
          <Badge
            text={String(
              (filterQuery
                ? assetQuery.data?.length
                : totalTimeSeriesOnAsset) || 0
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
              (filterQuery
                ? relatedQuery.data?.length
                : totalTimeSeriesUnderAsset) || 0
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
