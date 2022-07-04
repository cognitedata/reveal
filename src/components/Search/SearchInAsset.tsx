import { ChangeEvent, useMemo } from 'react';
import {
  Body,
  Button,
  Checkbox,
  Detail,
  Icon,
  Input,
  Micro,
  Tooltip,
} from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import {
  useAggregate,
  useInfiniteSearch,
  useSearch,
} from '@cognite/sdk-react-query-hooks';
import TimeseriesSearchResultItem from 'components/SearchResultTable/TimeseriesSearchResultItem';
import { useAsset } from 'hooks/cdf-assets';
import { useSearchParam } from 'hooks/navigation';
import chartAtom from 'models/charts/charts/atoms/atom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRecoilState } from 'recoil';
import { trackUsage } from 'services/metrics';
import styled from 'styled-components';
import { ASSET_KEY, TS_SEARCH_KEY } from 'utils/constants';
import { useDebounce } from 'use-debounce';
import { PnidButton } from 'components/SearchResultTable/PnidButton';
import { useAddRemoveTimeseries } from './hooks';

type SearchInAssetProps = {
  query: string;
  setQuery: (query: string) => void;
};

const SearchInAsset = ({ query, setQuery }: SearchInAssetProps) => {
  const [urlQuery = ''] = useSearchParam(TS_SEARCH_KEY, false);
  const [urlAssetId, setUrlAssetId] = useSearchParam(ASSET_KEY, false);
  const [debouncedUrlQuery] = useDebounce(urlQuery, 200);

  const [chart] = useRecoilState(chartAtom);
  const handleTimeSeriesClick = useAddRemoveTimeseries();

  const { data: asset } = useAsset(Number(urlAssetId));
  const { data, isLoading, hasNextPage, fetchNextPage } =
    useInfiniteSearch<Timeseries>(
      'timeseries',
      debouncedUrlQuery,
      20,
      {
        assetIds: [asset?.id],
      },
      { enabled: Boolean(asset?.id) }
    );

  const { data: totalAmount } = useAggregate(
    'timeseries',
    {
      assetIds: [asset?.id],
    },
    { enabled: Boolean(asset?.id) }
  );

  const { data: search = [], isFetched: searchDone } = useSearch<Timeseries>(
    'timeseries',
    debouncedUrlQuery,
    { limit: 1000, filter: { assetIds: [asset?.id] } },
    { enabled: Boolean(asset?.id) }
  );

  const timeseries = useMemo(
    () =>
      data?.pages?.reduce(
        (accl, page) => accl.concat(page),
        [] as Timeseries[]
      ) || [],
    [data]
  );

  const selectedExternalIds: undefined | string[] = chart?.timeSeriesCollection
    ?.map((t) => t.tsExternalId || '')
    .filter(Boolean);

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQuery(value);
  };

  return (
    <SearchContainer>
      <AssetContainer>
        <Header>
          <Tooltip content="Back to search results">
            <Button
              type="ghost"
              icon="ArrowLeft"
              aria-label="Back"
              onClick={() => {
                setUrlAssetId(undefined);
                setQuery('');
              }}
            />
          </Tooltip>
          <AssetInfo>
            <Body level="2" strong>
              {asset?.name}
            </Body>
            <Micro>{asset?.description}</Micro>
          </AssetInfo>
          <PnidButton asset={asset}>P&amp;ID</PnidButton>
        </Header>
        <InputContainer>
          <Input
            icon="Search"
            placeholder="Search"
            size="large"
            fullWidth
            value={query}
            onChange={handleSearchInputChange}
            clearable={{
              callback: () => {
                setQuery('');
              },
            }}
          />
          <Detail>
            {urlQuery.length > 0 && searchDone && `${search.length} of `}
            {totalAmount?.count || 0} time series
          </Detail>
        </InputContainer>
        <ResultContainer id="timeseries-results">
          {isLoading && <Icon type="Loader" />}
          {!isLoading && (
            <>
              <TSList>
                <InfiniteScroll
                  dataLength={timeseries.length}
                  next={() => fetchNextPage()}
                  hasMore={Boolean(hasNextPage)}
                  loader={<Icon type="Loader" />}
                  scrollableTarget="timeseries-results"
                >
                  {timeseries?.map((ts) => (
                    <TimeseriesSearchResultItem
                      key={ts.id}
                      timeseries={ts}
                      query={urlQuery}
                      renderCheckbox={() => (
                        <Checkbox
                          onClick={(e) => {
                            e.preventDefault();
                            handleTimeSeriesClick(ts);
                            trackUsage('ChartView.AddTimeSeries', {
                              source: 'search',
                            });
                          }}
                          name={`${ts.id}`}
                          checked={selectedExternalIds?.includes(
                            ts.externalId || ''
                          )}
                        />
                      )}
                    />
                  ))}
                </InfiniteScroll>
              </TSList>
            </>
          )}
        </ResultContainer>
      </AssetContainer>
    </SearchContainer>
  );
};

const SearchContainer = styled.div`
  height: 100%;
  padding-right: 9px;
`;

const AssetContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--cogs-border-default);
  border-radius: 6px;
  height: 100%;
`;

const InputContainer = styled.div`
  padding: 0 14px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px 10px 10px 0;
`;

const AssetInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-right: 10px;
`;

const ResultContainer = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const TSList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 10px 0 10px 0;
  list-style: none;
`;

export default SearchInAsset;
