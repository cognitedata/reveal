import { Icon, Button, Checkbox } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { trackUsage } from 'services/metrics';
import { useRecoilState } from 'recoil';
import { useAddRemoveTimeseries } from 'components/Search/hooks';
import EmptyResult, {
  defaultTranslations as emptyResultDefaultTranslations,
} from 'components/Search/EmptyResult';
import chartAtom from 'models/chart/atom';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import RecentViewSources from './RecentViewSources';
import TimeseriesSearchResultItem from './TimeseriesSearchResultItem';
import { useTimeseriesSearchResult } from './hooks';

type Props = {
  query: string;
  searchResults: ReturnType<typeof useTimeseriesSearchResult>;
};

const defaultTranslations = makeDefaultTranslations('Additional time series');

export default function SearchTimeseries({ query, searchResults }: Props) {
  const [chart] = useRecoilState(chartAtom);
  const handleTimeSeriesClick = useAddRemoveTimeseries();

  const {
    resultExactMatch: timeseriesExactMatch,
    results: timeseries,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    hasResults,
  } = searchResults;

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

  if (isError) {
    return <Icon type="CloseLarge" />;
  }

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (!hasResults && query !== '') {
    return (
      <EmptyResult
        itemType="timeseries"
        translations={emptyResultTranslations}
      />
    );
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
