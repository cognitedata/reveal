import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import debounce from 'lodash/debounce';

import {
  Body,
  Colors,
  Flex,
  Icon,
  Input,
  Loader,
  Title,
} from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import CategorySidebar from '../../components/category-sidebar/CategorySidebar';
import { ExtractorLibraryCategory } from '../../components/category-sidebar/CategorySidebarItem';
import { ContentContainer } from '../../components/ContentContainer';
import { CreateExtractor } from '../../components/CreateExtractor';
import ExtractorLibraryList from '../../components/extractor-library-list/ExtractorLibraryList';
import { Layout } from '../../components/Layout';
import { ListHeader } from '../../components/ListHeader';
import SearchHelper from '../../components/search-helper/SearchHelper';
import { useExtractorsList } from '../../hooks/useExtractorsList';
import { useSourceSystems } from '../../hooks/useSourceSystems';
import { MixpanelEvent, trackUsage } from '../../utils';
import { grepContains, prepareSearchString } from '../../utils/utils';

const debouncedTrackUsage = debounce((mixpanelEvent: MixpanelEvent) => {
  trackUsage(mixpanelEvent);
}, 1000);

const Extractors = () => {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';
  const category = searchParams.get(
    'category'
  ) as ExtractorLibraryCategory | null;

  const { data: extractorsRaw, status } = useExtractorsList();
  const { data: sourceSystems } = useSourceSystems();

  const extractors = useMemo(() => {
    return extractorsRaw?.filter(({ type }) => type !== 'hosted');
  }, [extractorsRaw]);
  const hostedExtractors = useMemo(() => {
    return extractorsRaw?.filter(({ type }) => type === 'hosted');
  }, [extractorsRaw]);

  const [filteredExtractors, filteredHostedExtractors, filteredSourceSystems] =
    useMemo(() => {
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

      const tempHostedExtractors =
        hostedExtractors?.filter((extractor) => {
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

      return [tempExtractors, tempHostedExtractors, tempSourceSystems];
    }, [extractors, hostedExtractors, sourceSystems, searchQuery]);

  const filteredExtractorLibraryItems = useMemo(() => {
    if (category === 'extractor') {
      return filteredExtractors;
    }

    if (category === 'hosted-extractor') {
      return filteredHostedExtractors;
    }

    if (category === 'source-system') {
      return filteredSourceSystems;
    }

    return [
      ...filteredExtractors,
      ...filteredHostedExtractors,
      ...filteredSourceSystems,
    ];
  }, [
    category,
    filteredExtractors,
    filteredHostedExtractors,
    filteredSourceSystems,
  ]);

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
                debouncedTrackUsage({
                  e: 'Search.Extractor',
                  query: e.currentTarget.value,
                });
                handleSearchQueryUpdate(e.currentTarget.value);
              }}
            />
            <Flex gap={40}>
              <CategorySidebar
                extractorsList={filteredExtractors}
                hostedExtractorsList={filteredHostedExtractors}
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
                {filteredExtractorLibraryItems.length ? (
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
