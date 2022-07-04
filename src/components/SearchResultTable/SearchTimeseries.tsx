import { useMemo } from 'react';
import { Icon, Button, Checkbox } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import { useCdfItems, useInfiniteSearch } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components/macro';
import { trackUsage } from 'services/metrics';
import { useRecoilState } from 'recoil';
import { useAddRemoveTimeseries } from 'components/Search/hooks';
import EmptyResult, {
  defaultTranslations as emptyResultDefaultTranslations,
} from 'components/Search/EmptyResult';
import chartAtom from 'models/charts/charts/atoms/atom';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { SearchFilter } from 'components/Search/Search';
import RecentViewSources from './RecentViewSources';
import TimeseriesSearchResultItem from './TimeseriesSearchResultItem';

type Props = {
  query: string;
  filter: SearchFilter;
};

const defaultTranslations = makeDefaultTranslations('Additional time series');

export default function SearchTimeseries({ query, filter }: Props) {
  const [chart] = useRecoilState(chartAtom);
  const handleTimeSeriesClick = useAddRemoveTimeseries();

  /**
   * Translations
   */
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'SearchResults').t,
  };

  const emptyResultTranslations = {
    ...emptyResultDefaultTranslations,
    ...useTranslations(
      Object.keys(emptyResultDefaultTranslations),
      'TimeseriesSearch'
    ).t,
  };

  const rootAssetFilter = filter.rootAsset
    ? { assetSubtreeIds: [{ externalId: filter.rootAsset }] }
    : {};

  const {
    data: resourcesBySearch,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSearch<Timeseries>(
    'timeseries',
    query,
    20,
    { isStep: filter.isStep, isString: filter.isString, ...rootAssetFilter },
    {
      enabled: !!query,
    }
  );

  const { data: resourcesByExternalId } = useCdfItems<Timeseries>(
    'timeseries',
    [{ externalId: query }]
  );

  const timeseriesExactMatch = useMemo(
    () =>
      resourcesByExternalId?.filter(
        ({ externalId }) => externalId === query
      )[0],
    [resourcesByExternalId, query]
  );

  const timeseries = useMemo(
    () =>
      resourcesBySearch?.pages
        ?.reduce((accl, page) => accl.concat(page), [])
        .filter(
          ({ externalId }) => externalId !== timeseriesExactMatch?.externalId
        ),
    [resourcesBySearch, timeseriesExactMatch]
  );

  if (isError) {
    return <Icon type="CloseLarge" />;
  }

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (timeseries?.length === 0) {
    return <EmptyResult translations={emptyResultTranslations} />;
  }

  const selectedExternalIds: undefined | string[] = chart?.timeSeriesCollection
    ?.map((ts) => ts.tsExternalId || '')
    .filter(Boolean);

  const searchResultElements = timeseries?.map((ts) => (
    <TimeseriesSearchResultItem
      key={ts.id}
      timeseries={ts}
      query={query}
      renderCheckbox={() => (
        <Checkbox
          onClick={(e) => {
            e.preventDefault();
            handleTimeSeriesClick(ts);
            trackUsage('ChartView.AddTimeSeries', { source: 'search' });
          }}
          name={`${ts.id}`}
          checked={selectedExternalIds?.includes(ts.externalId || '')}
        />
      )}
    />
  ));

  const exactMatchResult = timeseriesExactMatch && (
    <TimeseriesSearchResultItem
      isExact
      key={timeseriesExactMatch.id}
      timeseries={timeseriesExactMatch}
      query={query}
      renderCheckbox={() => (
        <Checkbox
          onClick={(e) => {
            e.preventDefault();
            handleTimeSeriesClick(timeseriesExactMatch);
          }}
          name={`${timeseriesExactMatch.id}`}
          checked={selectedExternalIds?.includes(
            timeseriesExactMatch.externalId || ''
          )}
        />
      )}
    />
  );

  return (
    <TSList>
      {!query && <RecentViewSources viewType="timeseries" />}
      {exactMatchResult}
      {searchResultElements}
      {hasNextPage && (
        <TSItem>
          <Button type="link" onClick={() => fetchNextPage()}>
            {t['Additional time series']}
          </Button>
        </TSItem>
      )}
    </TSList>
  );
}

const TSList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 0 0 10px 0;
  list-style: none;
`;

const TSItem = styled.li`
  border-radius: 5px;
  padding: 0 5px;
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
`;
