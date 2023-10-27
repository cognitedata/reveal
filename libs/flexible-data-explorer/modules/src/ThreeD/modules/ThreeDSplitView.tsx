import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';
import zIndex from '@fdx/shared/utils/zIndex';

import { SearchPanelToggleVisibilityButton } from '../components/SearchPanelToggleVisibilityButton';
import { Mapped3DEquipmentProvider } from '../providers/Mapped3DEquipmentProvider';
import { ThreeDContent } from '../ThreeDContent';
import { ThreeDSearchResults } from '../ThreeDSearchResults';

export const ThreeDSplitView = () => {
  const { instanceSpace, externalId, dataType } = useParams();
  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();
  const { toSearchPage } = useNavigation();

  const [isSearchResultsVisible, setIsSearchResultsVisible] = useState(
    externalId ? false : true
  );
  const [focusOnInstance, setFocusOnInstance] = useState<boolean>(false);

  useEffect(() => {
    setFocusOnInstance(false);
  }, [focusOnInstance]);

  const handleSearchPanelToggleVisibilityButtonClick = () => {
    setIsSearchResultsVisible((prevState) => !prevState);

    if (instanceSpace && externalId && dataType) {
      toSearchPage(query, filters, {
        selectedInstance: {
          instanceSpace,
          externalId,
          dataType,
        },
      });
    }
  };

  return (
    <Mapped3DEquipmentProvider>
      <SplitLayout>
        <SearchResultsContainer visible={isSearchResultsVisible}>
          <ThreeDSearchResults
            onZoomButtonClick={() => {
              setFocusOnInstance(true);
            }}
          />
          <StyledSearchPanelToggleVisibilityButton
            onClick={handleSearchPanelToggleVisibilityButtonClick}
            isPanelClosed={!isSearchResultsVisible}
          />
        </SearchResultsContainer>

        <ThreeDContentContainer>
          <ThreeDContent focusOnInstance={focusOnInstance} />
        </ThreeDContentContainer>
      </SplitLayout>
    </Mapped3DEquipmentProvider>
  );
};

const SplitLayout = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
`;

const StyledSearchPanelToggleVisibilityButton = styled(
  SearchPanelToggleVisibilityButton
)`
  position: absolute;
  right: -65px;
  top: 16px;
  z-index: ${zIndex.THREED_SEARCH_PANEL_BUTTON};
`;

const SearchResultsContainer = styled.div<{ visible?: boolean }>`
  transition: flex 0.5s ease-in-out;
  position: relative;
  border-right: 1px solid rgba(83, 88, 127, 0.16);
  flex: ${(props) => (props.visible ? '1' : '0')};
  min-width: 0;
  max-width: 600px;
`;

const ThreeDContentContainer = styled.div`
  width: 100%;
  transition: flex 0.3s ease-in-out;
  z-index: ${zIndex.PAGE_HEADER};
  flex: 2;
`;
