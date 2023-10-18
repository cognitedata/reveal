import { Suspense } from 'react';

import styled from 'styled-components';

import { Page } from '../containers/page/Page';
import { AIResults } from '../containers/search/results/AIResults';
import { SearchResults } from '../containers/search/results/SearchResults';
import { SearchCategories } from '../containers/search/SearchCategories';
import { SearchConfiguration } from '../containers/search/SearchConfiguration';
import { useAISearchParams } from '../hooks/useParams';

export const SearchPage = () => {
  const [isAIEnabled] = useAISearchParams();

  return (
    <Page>
      <Page.Body>
        <Container>
          <Suspense fallback="Loading">
            {!isAIEnabled && <SearchCategories />}

            <Content>
              <SearchConfiguration />
              {isAIEnabled ? <AIResults /> : <SearchResults />}
            </Content>
          </Suspense>
        </Container>
      </Page.Body>
    </Page>
  );
};

const Container = styled.div`
  display: flex;
  max-width: 100%;
  width: 100%;
  gap: 32px;
  padding-top: 24px;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;