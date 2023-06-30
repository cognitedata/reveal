import styled from 'styled-components';

import { Title } from '@cognite/cogs.js';

import { RecentlyViewedList } from '../containers/lists/recentlyViewed/RecentlyViewedList';
import { Page } from '../containers/page/Page';
import { DataExplorerLink } from '../containers/search/DataExplorerLink';
import { SearchBar } from '../containers/search/SearchBar';
import { SearchBarSwitch } from '../containers/search/SearchBarSwitch';
import { SearchConfiguration } from '../containers/search/SearchConfiguration';
import { useRecentlyVisited } from '../hooks/useRecentlyVisited';
import { useTranslation } from '../hooks/useTranslation';

export const HomePage = () => {
  const { t } = useTranslation();

  const [recentlyViewed] = useRecentlyVisited();

  return (
    <Page>
      <SearchContainer>
        <SearchConfiguration header />

        <SearchBarContainer>
          <SearchBar width="774px" disablePreview autoFocus />
          <SearchBarSwitch />
        </SearchBarContainer>

        <DataExplorerLink />
      </SearchContainer>

      <Page.Body>
        <RecentlyViewedContainer>
          {/* Code-smell... find a better way of handling this. */}
          {recentlyViewed.length > 0 && (
            <TitleContent>
              <Title level={6}>
                {t('RECENTLY_VIEWED_TITLE', {
                  count: recentlyViewed.length,
                })}
              </Title>
            </TitleContent>
          )}

          <RecentlyViewedList />
        </RecentlyViewedContainer>
      </Page.Body>
    </Page>
  );
};

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 60vh;

  box-sizing: border-box;

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

  border-bottom: 1px solid rgba(83, 88, 127, 0.16);
`;

const RecentlyViewedContainer = styled.div`
  height: 10%;
  padding-top: 24px;
  padding-bottom: 24px;
  width: 774px;
  max-width: 774px;
  align-self: center;
`;

const TitleContent = styled.div`
  padding-left: 8px;
  padding-bottom: 16px;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
