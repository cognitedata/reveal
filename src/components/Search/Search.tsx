import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, Input, Tooltip, SegmentedControl } from '@cognite/cogs.js';
import SearchResultList from 'components/SearchResultTable/SearchResultList';
import SearchTimeseries from 'components/SearchResultTable/SearchTimeseries';
import styled from 'styled-components/macro';
import { SEARCH_KEY } from 'utils/constants';
import { useSearchParam } from 'hooks';
import debounce from 'lodash/debounce';
import InfoBox from 'components/InfoBox';

type SearchProps = {
  visible: boolean;
  onClose?: () => void;
};

const Search = ({ visible, onClose }: SearchProps) => {
  const [searchType, setSearchType] = useState<'assets' | 'timeseries'>(
    'assets'
  );
  const [searchInputValue, setSearchInputValue] = useState('');
  const [urlQuery = '', setUrlQuery] = useSearchParam(SEARCH_KEY, false);
  const debouncedSetUrlQuery = debounce(setUrlQuery, 200);

  useEffect(() => {
    if (searchInputValue !== urlQuery) {
      setSearchInputValue(urlQuery);
    }
    // Should NOT run when searchInputValue changes
    // eslint-disable-next-line
  }, [urlQuery, setSearchInputValue]);

  useEffect(() => {
    if (searchInputValue !== urlQuery) {
      debouncedSetUrlQuery(encodeURIComponent(searchInputValue));
    }
    return () => debouncedSetUrlQuery.cancel();
  }, [searchInputValue, urlQuery, debouncedSetUrlQuery]);

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchInputValue(value);
    window.dispatchEvent(new Event('storage')); // dispatch event to notify changes in RecentView
  };

  return (
    <SearchContainer visible={visible}>
      <ContentWrapper visible={visible}>
        <SearchBar>
          <div style={{ flexGrow: 1 }}>
            <Input
              fullWidth
              icon="Search"
              placeholder="Find time series to plot"
              onChange={handleSearchInputChange}
              value={searchInputValue}
              size="large"
              clearable={{
                labelText: 'Clear text',
                callback: () => {
                  setSearchInputValue('');
                },
              }}
              autoFocus
            />
          </div>
          <Tooltip content="Hide">
            <Button
              icon="PanelLeft"
              type="ghost"
              onClick={onClose}
              aria-label="close"
            />
          </Tooltip>
        </SearchBar>
        <div style={{ marginTop: 16, marginRight: 10 }}>
          <SegmentedControl
            currentKey={searchType}
            fullWidth
            onButtonClicked={(type) =>
              setSearchType(type as 'assets' | 'timeseries')
            }
          >
            <SegmentedControl.Button key="assets">
              Tag number
            </SegmentedControl.Button>
            <SegmentedControl.Button key="timeseries">
              Timeseries ID
            </SegmentedControl.Button>
          </SegmentedControl>
          {/* {searchType === 'assets' && (
            <label
              className="cogs-switch"
              htmlFor="example"
              style={{ marginTop: 10 }}
            >
              <input type="checkbox" name="example" id="example" />
              <div className="switch-ui" />
              Hide empty assets
            </label>
          )} */}
        </div>
        <SearchResultsContainer>
          {searchType === 'assets' && (
            <>
              <InfoBox infoType="TagHelpBox" query={urlQuery} />
              <SearchResultList query={urlQuery} />
            </>
          )}
          {searchType === 'timeseries' && (
            <>
              <InfoBox infoType="TimeSeriesHelpBox" query={urlQuery} />
              <SearchTimeseries query={urlQuery} />
            </>
          )}
        </SearchResultsContainer>
      </ContentWrapper>
    </SearchContainer>
  );
};

const SearchContainer = styled.div<SearchProps>`
  height: 100%;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  width: ${(props) => (props.visible ? '30%' : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  padding: ${(props) => (props.visible ? '20px 0 10px 10px' : 0)};
  transition: visibility 0s linear 200ms, width 200ms ease;

  .cog-button-group {
    & > span {
      width: 50%;
      button {
        width: 100%;
      }
    }
  }
`;

const ContentWrapper = styled.div<SearchProps>`
  height: 100%;
  width: 100%;
  opacity: ${(props) => (props.visible ? 1 : 0)};
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

export default Search;
