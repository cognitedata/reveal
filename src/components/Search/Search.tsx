import {
  Input,
  Tooltip,
  Button,
  SegmentedControl,
  Flex,
  Dropdown,
} from '@cognite/cogs.js';
import InfoBox from 'components/InfoBox';
import SearchResultList from 'components/SearchResultTable/SearchResultList';
import SearchTimeseries from 'components/SearchResultTable/SearchTimeseries';
import { useSearchParam } from 'hooks/navigation';
import { useState, ChangeEvent } from 'react';
import { metrics } from 'services/metrics';
import styled from 'styled-components';
import { SEARCH_KEY } from 'utils/constants';
import { useDebounce } from 'use-debounce';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { defaultTranslations as infoBoxDefaultTranslation } from 'components/InfoBox/InfoBox';
import {
  defaultTranslations as filterDropdownDefaultTranslation,
  SearchFilterSettings,
} from 'components/Search/FilterDropdown';
import EmptyResult, {
  defaultTranslations as emptyResultDefaultTranslations,
} from 'components/Search/EmptyResult';
import FilterDropdown from './FilterDropdown';

export type SearchFilter = {
  showEmpty: boolean;
  isStep?: boolean;
  isString?: boolean;
};

export const defaultTranslations = makeDefaultTranslations(
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
};

const Search = ({ query, setQuery, onClose }: SearchProps) => {
  const [urlQuery = ''] = useSearchParam(SEARCH_KEY, false);
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
  };

  const handleFilterChange = (field: string, val?: boolean) => {
    metrics.track(`Search.Filters.${field}`, { value: val });

    setFilterSettings((existingFilterSettings) => ({
      ...existingFilterSettings,
      [field]: val,
    }));
  };

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQuery(value);
  };

  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'TimeseriesSearch').t,
  };

  const infoBoxTranslations = {
    ...infoBoxDefaultTranslation,
    ...useTranslations(
      Object.keys(infoBoxDefaultTranslation),
      'TimeseriesSearch'
    ).t,
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

  return (
    <>
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
      <Flex style={{ marginTop: 16, marginRight: 10 }}>
        <SegmentedControl
          currentKey={searchType}
          fullWidth
          onButtonClicked={(type) =>
            setSearchType(type as 'assets' | 'timeseries')
          }
          style={{ marginRight: 10 }}
        >
          <SegmentedControl.Button key="assets">
            {t['Equipment tag']}
          </SegmentedControl.Button>
          <SegmentedControl.Button key="timeseries">
            {t['Time series']}
          </SegmentedControl.Button>
        </SegmentedControl>
        <Dropdown
          content={
            <FilterDropdown
              translations={filterDropdownTranslations}
              settings={filterSettings}
              onFilterChange={handleFilterChange}
            />
          }
          onShown={() => metrics.track('Search.Filters.Open')}
        >
          <Button icon="Filter" toggled={!isEmpty} />
        </Dropdown>
      </Flex>
      {isEmpty ? (
        <EmptyResult translations={emptyResultTranslations} />
      ) : (
        <SearchResultsContainer>
          {searchType === 'assets' && (
            <>
              <InfoBox
                translations={infoBoxTranslations}
                infoType="TagHelpBox"
                query={debouncedUrlQuery}
              />
              <SearchResultList query={debouncedUrlQuery} filter={filter} />
            </>
          )}
          {searchType === 'timeseries' && (
            <>
              <InfoBox
                translations={infoBoxTranslations}
                infoType="TimeSeriesHelpBox"
                query={debouncedUrlQuery}
              />
              <SearchTimeseries query={debouncedUrlQuery} filter={filter} />
            </>
          )}
        </SearchResultsContainer>
      )}
    </>
  );
};

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

export default Search;
