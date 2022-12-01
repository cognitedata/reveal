import { Colors, Flex, Input, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useExtractorsList } from 'hooks/useExtractorsList';
import { ListHeader } from 'components/ListHeader';
import { Layout } from 'components/Layout';
import { ExtractorsList } from 'components/ExtractorsList';
import { CreateExtractor } from 'components/CreateExtractor';
import { ContentContainer } from 'components/ContentContainer';
import CategorySidebar from 'components/category-sidebar/CategorySidebar';
import { trackUsage } from 'utils';
import { useTranslation } from 'common';
import { useSearchParams } from 'react-router-dom';

const Extractors = () => {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  const { data: extractors, status } = useExtractorsList();

  const extractorsList =
    extractors?.filter((extractor) => {
      const searchLowercase = searchQuery.toLowerCase();
      if (extractor.description?.toLowerCase()?.includes(searchLowercase)) {
        return true;
      }
      if (extractor.name.toLowerCase().includes(searchLowercase)) {
        return true;
      }
      if (
        extractor?.tags?.map((t) => t.toLowerCase()).includes(searchLowercase)
      ) {
        return true;
      }
      return false;
    }, []) ?? [];

  const handleSearchQueryUpdate = (query: string) => {
    const updatedSearchParams = new URLSearchParams(searchParams);
    updatedSearchParams.set('q', query);
    setSearchParams(updatedSearchParams, { replace: true });
  };

  if (status === 'loading') {
    return <Loader />;
  }

  return (
    <Layout>
      <ListHeader />
      <Layout.Container>
        <ContentContainer>
          <Flex direction="column" gap={16}>
            <StyledSearchInput
              size="large"
              fullWidth
              placeholder={t('search-for-source-systems')}
              value={searchQuery}
              onChange={(e) => {
                trackUsage({ e: 'Search.Extractor' });
                handleSearchQueryUpdate(e.currentTarget.value);
              }}
            />
            <Flex gap={40}>
              <CategorySidebar extractorsList={extractorsList} />
              <StyledListContainer>
                {searchQuery ? (
                  <StyledSearchResults>
                    {t('search-results', {
                      count: extractorsList.length,
                      query: searchQuery,
                    })}
                  </StyledSearchResults>
                ) : (
                  <CreateExtractor />
                )}
                <ExtractorsList extractorsList={extractorsList} />
              </StyledListContainer>
            </Flex>
          </Flex>
        </ContentContainer>
      </Layout.Container>
    </Layout>
  );
};

const StyledListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const StyledSearchResults = styled.div`
  color: ${Colors['text-icon--muted']};
`;

const StyledSearchInput = styled(Input).attrs({
  type: 'search',
  icon: 'Search',
})`
  svg {
    color: ${Colors['text-icon--muted']};

    path {
      fill: currentColor;
    }
  }
`;

export default Extractors;
