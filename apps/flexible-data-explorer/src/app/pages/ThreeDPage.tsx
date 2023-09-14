import { useState } from 'react';

import styled from 'styled-components';

import { Page } from '../containers/page/Page';
import { SearchPanelCloseButton } from '../containers/ThreeD/components/SearchPanelCloseButton';
import { ThreeDContent } from '../containers/ThreeD/ThreeDContent';
import { ThreeDSearchResults } from '../containers/ThreeD/ThreeDSearchResults';
import { Mapped3DEquipmentProvider } from '../providers/Mapped3DEquipmentProvider';
import zIndex from '../utils/zIndex';

export const ThreeDPage = () => {
  const [searchResultsVisible, setSearchResultsVisible] = useState(true);

  return (
    <Page disableScrollbarGutter>
      <Page.Body fullscreen>
        <Mapped3DEquipmentProvider>
          <SplitLayout>
            <SearchResultsContainer visible={searchResultsVisible}>
              <ThreeDSearchResults />
              <StyledSearchPanelCloseButton
                onClick={() => setSearchResultsVisible(!searchResultsVisible)}
                isPanelClosed={!searchResultsVisible}
              />
            </SearchResultsContainer>

            <ThreeDContentContainer fullScreen={!searchResultsVisible}>
              <ThreeDContent />
            </ThreeDContentContainer>
          </SplitLayout>
        </Mapped3DEquipmentProvider>
      </Page.Body>
    </Page>
  );
};

const SplitLayout = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
`;

const StyledSearchPanelCloseButton = styled(SearchPanelCloseButton)`
  position: absolute;
  right: -56px;
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

const ThreeDContentContainer = styled.div<{ fullScreen?: boolean }>`
  width: 100%;
  transition: flex 0.3s ease-in-out;
  z-index: ${zIndex.PAGE_HEADER};
  flex: 2;
`;
