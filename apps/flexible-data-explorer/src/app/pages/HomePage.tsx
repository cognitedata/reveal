import { useEffect } from 'react';

import styled from 'styled-components';

import { AIDisclaimer } from '../components/links/AIDisclaimer';
import { Categories } from '../containers/category/Categories';
import { Page } from '../containers/page/Page';
import { AILabels } from '../containers/search/components/AILabels';
import { AISwitch } from '../containers/search/components/AISwitch';
import { SearchBar } from '../containers/search/SearchBar';
import { SearchConfiguration } from '../containers/search/SearchConfiguration';
import { useIsCogpilotEnabled } from '../hooks/useFlag';
import { useAISearchParams } from '../hooks/useParams';

const SEARCH_BAR_OPTIONS = {
  filterMenuMaxHeight: '50vh',
};

export const HomePage = () => {
  const [isAIEnabled, setIsAIEnabled] = useAISearchParams();
  const isCopilotEnabled = useIsCogpilotEnabled();

  useEffect(() => {
    if (!isCopilotEnabled && isAIEnabled) {
      setIsAIEnabled(false);
    }
  }, [setIsAIEnabled, isAIEnabled, isCopilotEnabled]);

  return (
    <Page disableScrollbarGutter>
      <SearchContainer $isAIEnabled={isAIEnabled}>
        <AILabelsContainer $isAIEnabled={isAIEnabled}>
          <AILabels />
        </AILabelsContainer>

        <SearchConfiguration header />
        <SearchBarContainer className="search-bar-container">
          <SearchBar options={SEARCH_BAR_OPTIONS} />
        </SearchBarContainer>

        {isAIEnabled && <AIDisclaimer />}

        {isCopilotEnabled && (
          <AISwitchContainer>
            <AISwitch />
          </AISwitchContainer>
        )}
      </SearchContainer>

      <Page.Body>{!isAIEnabled && <Categories />}</Page.Body>
    </Page>
  );
};

const SearchContainer = styled.div<{ $isAIEnabled: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 64px;
  min-height: ${(props) => (props.$isAIEnabled ? '100%' : '60vh')};
  box-sizing: border-box;
  transition: 0.3s all;
  border-bottom: 1px solid rgba(83, 88, 127, 0.16);

  &&:before {
    content: '';
    background: var(
      --bg,
      radial-gradient(
        141.23% 94.33% at 19.9% 45.6%,
        rgba(111, 59, 228, 0.36) 0%,
        rgba(86, 37, 186, 0) 100%
      ),
      radial-gradient(
        115.12% 80.81% at 76.81% 40.18%,
        rgba(102, 40, 240, 0.29) 0%,
        rgba(142, 92, 255, 0.15) 100%
      ),
      #fff
    );
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: ${(props) => (props.$isAIEnabled ? 1 : 0)};
    transition: 0.3s all;
    z-index: -1;
  }

  &&:after {
    content: '';
    background: radial-gradient(
        62.29% 135.84% at 0% 0%,
        rgba(10, 119, 247, 0.1024) 0%,
        rgba(10, 119, 246, 0) 100%
      ),
      radial-gradient(
        40.38% 111.35% at 76.81% 40.18%,
        rgba(84, 108, 241, 0.16) 0%,
        rgba(84, 108, 241, 0) 100%
      ),
      #ffffff;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -2;
  }
`;

const SearchBarContainer = styled.div`
  max-width: 774px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  gap: 16px;
`;

const AISwitchContainer = styled.div`
  justify-self: flex-end;
  margin-bottom: 24px;
  position: absolute;
  bottom: 0;
`;

const AILabelsContainer = styled.div<{ $isAIEnabled: boolean }>`
  margin-bottom: 16px;
  opacity: ${(props) => (props.$isAIEnabled ? 1 : 0)};
  transition: 0.3s all;
`;
