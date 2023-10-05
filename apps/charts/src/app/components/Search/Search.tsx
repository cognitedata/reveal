import {
  useState,
  ChangeEvent,
  SetStateAction,
  Dispatch,
  useMemo,
} from 'react';

import styled from 'styled-components';

import { useRecoilState } from 'recoil';
import { useDebounce } from 'use-debounce';

import {
  Input,
  Tooltip,
  Button,
  SegmentedControl,
  Flex,
  Dropdown,
  Icon,
} from '@cognite/cogs.js';

import { useRootAssets } from '../../hooks/cdf-assets';
import { useSearchParam } from '../../hooks/navigation';
import { useTranslations } from '../../hooks/translations';
import { facilityAtom } from '../../models/facility/atom';
import { trackUsage } from '../../services/metrics';
import { SEARCH_KEY } from '../../utils/constants';
import { makeDefaultTranslations } from '../../utils/translations';
import {
  useAssetSearchResults,
  useTimeseriesSearchResult,
} from '../SearchResultTable/hooks';
import SearchResultList from '../SearchResultTable/SearchResultList';
import SearchTimeseries from '../SearchResultTable/SearchTimeseries';

import EmptyResult, {
  defaultTranslations as emptyResultDefaultTranslations,
} from './EmptyResult';
import FilterDropdown, {
  defaultTranslations as filterDropdownDefaultTranslation,
  SearchFilterSettings,
} from './FilterDropdown';
import SearchTooltip from './SearchTooltip';

export type SearchFilter = {
  showEmpty: boolean;
  isStep?: boolean;
  isString?: boolean;
  rootAsset?: string;
};

const defaultTranslations = makeDefaultTranslations(
  'Find time series',
  'Clear text',
  'Hide',
  'Equipment tag',
  'Time series'
);

type SearchProps = {
  query: string;
  setQuery: (query: string) => void;
  onClose?: () => void;
  updateFilterInRoot: Dispatch<SetStateAction<SearchFilter>>;
};

const Search = ({
  query,
  setQuery,
  onClose,
  updateFilterInRoot,
}: SearchProps) => {
  const [urlQuery = ''] = useSearchParam(SEARCH_KEY);
  const [debouncedUrlQuery] = useDebounce(urlQuery, 200);
  const [searchType, setSearchType] = useState<'assets' | 'timeseries'>(
    'assets'
  );

  const [filterSettings, setFilterSettings] = useState<SearchFilterSettings>({
    isShowEmptyChecked: false,
    isTimeseriesChecked: true,
    isStepChecked: true,
    isStringChecked: false,
  });

  const { data: rootAssets = [] } = useRootAssets();
  const [selectedFacility, setSelectedFacility] = useRecoilState(facilityAtom);
  const selectedFacilityExistsInAvailableRootAssets = !!rootAssets.find(
    (asset) => asset.externalId === selectedFacility
  );

  const isEmpty =
    !filterSettings.isTimeseriesChecked &&
    !filterSettings.isStepChecked &&
    !filterSettings.isStringChecked;

  const reversedIsStepChecked = filterSettings.isStepChecked
    ? undefined
    : false;

  /**
   * Generate the actual search filter based on the filter settings
   */
  const filter: SearchFilter = {
    showEmpty: filterSettings.isShowEmptyChecked,
    isStep: filterSettings.isTimeseriesChecked
      ? reversedIsStepChecked
      : filterSettings.isStepChecked,
    isString: filterSettings.isStringChecked,
    rootAsset: selectedFacilityExistsInAvailableRootAssets
      ? selectedFacility
      : undefined,
  };

  useMemo(() => {
    updateFilterInRoot(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.showEmpty, filter.isStep, filter.isString, filter.rootAsset]);

  const handleFilterChange = (field: string, val?: boolean) => {
    trackUsage(`Search.Filters.${field}`, { value: val });

    setFilterSettings((existingFilterSettings: SearchFilterSettings) => ({
      ...existingFilterSettings,
      [field]: val,
    }));
  };

  const handleFacilityChange = (facilityExternalId: string) => {
    trackUsage(`Search.Filters.facility`, { value: facilityExternalId });
    setSelectedFacility(facilityExternalId);
  };

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQuery(value);
  };

  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'TimeseriesSearch').t,
  };

  const filterDropdownTranslations = {
    ...filterDropdownDefaultTranslation,
    ...useTranslations(
      Object.keys(filterDropdownDefaultTranslation),
      'TimeseriesSearch'
    ).t,
  };

  const emptyResultTranslations = {
    ...emptyResultDefaultTranslations,
    ...useTranslations(
      Object.keys(emptyResultDefaultTranslations),
      'TimeseriesSearch'
    ).t,
  };

  const assetSearchResults = useAssetSearchResults({ query, filter });
  const timeseriesSearchResults = useTimeseriesSearchResult({
    query,
    filter,
  });

  const { tsCountLoading, totalCount: tsTotalCount } = timeseriesSearchResults;
  const { assetCountLoading, totalCount: assetTotalCount } = assetSearchResults;

  return (
    <>
      <SearchTooltip>
        <SearchBar>
          <div style={{ flexGrow: 1 }}>
            <Input
              fullWidth
              icon="Search"
              placeholder={t['Find time series']}
              value={query}
              onChange={handleSearchInputChange}
              size="large"
              clearable={{
                callback: () => {
                  setQuery('');
                },
              }}
              autoFocus
            />
          </div>
          <Tooltip content={t.Hide}>
            <Button
              icon="PanelLeft"
              type="ghost"
              onClick={onClose}
              aria-label="close"
            />
          </Tooltip>
        </SearchBar>
      </SearchTooltip>
      <StyledFlex>
        <SegmentedControl
          currentKey={searchType}
          fullWidth
          onButtonClicked={(type) =>
            setSearchType(type as 'assets' | 'timeseries')
          }
        >
          <SegmentedControl.Button key="assets">
            {t['Equipment tag']}
            <SearchCount>
              {assetCountLoading &&
              query &&
              !filterSettings.isShowEmptyChecked ? (
                <Icon type="Loader" />
              ) : (
                assetTotalCount
              )}
            </SearchCount>
          </SegmentedControl.Button>
          <SegmentedControl.Button key="timeseries">
            {t['Time series']}
            <SearchCount>
              {query && tsCountLoading ? <Icon type="Loader" /> : tsTotalCount}
            </SearchCount>
          </SegmentedControl.Button>
        </SegmentedControl>
        <Dropdown
          content={
            <FilterDropdown
              selectedFacility={selectedFacility}
              availableFacilities={rootAssets}
              onFacilityChange={handleFacilityChange}
              translations={filterDropdownTranslations}
              settings={filterSettings}
              onFilterChange={handleFilterChange}
            />
          }
          onShown={() => trackUsage('Search.Filters.Open')}
        >
          <Button icon="Filter" aria-label="Filter" toggled={!isEmpty} />
        </Dropdown>
      </StyledFlex>
      {isEmpty ? (
        <EmptyResult itemType="assets" translations={emptyResultTranslations} />
      ) : (
        <SearchResultsContainer>
          {searchType === 'assets' && (
            <SearchResultList
              query={debouncedUrlQuery.trim()}
              filter={filter}
              searchResults={assetSearchResults}
            />
          )}
          {searchType === 'timeseries' && (
            <SearchTimeseries
              query={debouncedUrlQuery.trim()}
              searchResults={timeseriesSearchResults}
            />
          )}
        </SearchResultsContainer>
      )}
    </>
  );
};

const StyledFlex = styled(Flex)`
  margin-top: 16px;
  margin-right: 10px;
  .cogs-segmented-control {
    margin-right: 10px;
    width: 100%;
  }
`;

const SearchBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SearchResultsContainer = styled.div`
  padding-top: 1rem;
  padding-bottom: 2rem;
  height: calc(100% - 70px);
  overflow: auto;
  width: 100%;
`;

const SearchCount = styled.span`
  margin-left: 3pt;
`;

export default Search;
