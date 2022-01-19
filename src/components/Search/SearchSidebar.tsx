import { useCallback } from 'react';
import styled from 'styled-components';
import { ASSET_KEY, SEARCH_KEY, TS_SEARCH_KEY } from 'utils/constants';
import { useSearchParam } from 'hooks/navigation';
import Search from './Search';
import SearchInAsset from './SearchInAsset';

type SearchSidebarProps = {
  visible: boolean;
  onClose?: () => void;
};

const SearchSidebar = ({ visible, onClose }: SearchSidebarProps) => {
  const [urlAssetId] = useSearchParam(ASSET_KEY, false);
  const [urlQuery = '', setUrlQuery] = useSearchParam(SEARCH_KEY, false);
  const [tsUrlQuery = '', setTsUrlQuery] = useSearchParam(TS_SEARCH_KEY, false);

  const handleUrlQueryChange = useCallback(
    (query) => {
      setUrlQuery(query);
    },
    [setUrlQuery]
  );

  const handleTsUrlQueryChange = useCallback(
    (query) => {
      setTsUrlQuery(query);
    },
    [setTsUrlQuery]
  );

  return (
    <SearchContainer visible={visible}>
      <ContentWrapper visible={visible}>
        {urlAssetId && (
          <SearchInAsset query={tsUrlQuery} setQuery={handleTsUrlQueryChange} />
        )}
        {!urlAssetId && (
          <Search
            query={urlQuery}
            setQuery={handleUrlQueryChange}
            onClose={onClose}
          />
        )}
      </ContentWrapper>
    </SearchContainer>
  );
};

const SearchContainer = styled.div<SearchSidebarProps>`
  height: 100%;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  width: ${(props) => (props.visible ? '30%' : 0)};
  min-width: ${(props) => (props.visible ? '270px' : 0)};
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

const ContentWrapper = styled.div<SearchSidebarProps>`
  height: 100%;
  width: 100%;
  opacity: ${(props) => (props.visible ? 1 : 0)};
`;

export default SearchSidebar;
