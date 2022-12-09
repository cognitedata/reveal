import {
  Body,
  Colors,
  Flex,
  Icon,
  Input,
  Loader,
  Title,
} from '@cognite/cogs.js';
import { useMemo } from 'react';
import styled from 'styled-components';

import { useExtractorsList } from 'hooks/useExtractorsList';
import { ListHeader } from 'components/ListHeader';
import { Layout } from 'components/Layout';
import { CreateExtractor } from 'components/CreateExtractor';
import { ContentContainer } from 'components/ContentContainer';
import CategorySidebar from 'components/category-sidebar/CategorySidebar';
import { trackUsage } from 'utils';
import { useTranslation } from 'common';
import { useSearchParams } from 'react-router-dom';
import SearchHelper from 'components/search-helper/SearchHelper';
import { useSourceSystems } from 'hooks/useSourceSystems';
import ExtractorLibraryList from 'components/extractor-library-list/ExtractorLibraryList';
import { ExtractorLibraryCategory } from 'components/category-sidebar/CategorySidebarItem';
import { grepContains, prepareSearchString } from 'utils/utils';

const Extractors = () => {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';
  const category = searchParams.get(
    'category'
  ) as ExtractorLibraryCategory | null;

  const { data: extractors, status } = useExtractorsList();
  const { data: sourceSystems } = useSourceSystems();

  const [filteredExtractors, filteredSourceSystems] = useMemo(() => {
    const querySet = prepareSearchString(searchQuery);

    const tempExtractors =
      extractors?.filter((extractor) => {
        const toSearch = [
          extractor.description,
          extractor.name,
          ...(extractor?.tags ?? []),
        ];
        const contentSet = new Set<string>();
        toSearch.forEach((s = '') => {
          const sSet = prepareSearchString(s);
          sSet.forEach((i) => {
            contentSet.add(i);
          });
        });
        return grepContains(contentSet, querySet);
      }, []) ?? [];

    const tempSourceSystems =
      sourceSystems?.filter((sourceSystem) => {
        const toSearch = [
          sourceSystem.description,
          sourceSystem.name,
          ...(sourceSystem?.tags ?? []),
        ];
        const contentSet = new Set<string>();
        toSearch.forEach((s = '') => {
          const sSet = prepareSearchString(s);
          sSet.forEach((i) => {
            contentSet.add(i);
          });
        });
        return grepContains(contentSet, querySet);
      }, []) ?? [];

    return [tempExtractors, tempSourceSystems];
  }, [extractors, sourceSystems, searchQuery]);

  const filteredExtractorLibraryItems = useMemo(() => {
    if (category === 'extractor') {
      return filteredExtractors;
    }

    if (category === 'source-system') {
      return filteredSourceSystems;
    }

    return [...filteredExtractors, ...filteredSourceSystems];
  }, [category, filteredExtractors, filteredSourceSystems]);

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
              <CategorySidebar
                extractorsList={filteredExtractors}
                sourceSystems={filteredSourceSystems}
              />
              <StyledListContainer>
                {searchQuery ? (
                  <StyledSearchResults>
                    {t('search-results', {
                      count: filteredExtractorLibraryItems.length,
                      query: searchQuery,
                    })}
                  </StyledSearchResults>
                ) : (
                  <CreateExtractor />
                )}
                {!!filteredExtractorLibraryItems.length ? (
                  <ExtractorLibraryList items={filteredExtractorLibraryItems} />
                ) : (
                  <StyledEmptyContainer>
                    <Icon size={24} type="ListSearch" />
                    <Flex alignItems="center" direction="column" gap={2}>
                      <Title level={5}>{t('no-results')}</Title>
                      <Body level={2}>
                        {t(
                          category
                            ? `no-results-description-${category}`
                            : 'no-results-description',
                          {
                            query: searchQuery,
                          }
                        )}
                      </Body>
                    </Flex>
                  </StyledEmptyContainer>
                )}
                {!!searchQuery && <SearchHelper />}
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

const StyledEmptyContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 48px;
`;

export default Extractors;
