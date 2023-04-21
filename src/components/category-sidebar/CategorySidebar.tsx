import React from 'react';

import { Flex, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import CategorySidebarItem from './CategorySidebarItem';
import { useExtractorsList } from 'hooks/useExtractorsList';
import { ExtractorWithReleases } from 'service/extractors';
import { SourceSystem, useSourceSystems } from 'hooks/useSourceSystems';

type CategorySidebarProps = {
  extractorsList: ExtractorWithReleases[];
  hostedExtractorsList: ExtractorWithReleases[];
  sourceSystems: SourceSystem[];
};

const CategorySidebar = ({
  extractorsList,
  hostedExtractorsList,
  sourceSystems,
}: CategorySidebarProps): JSX.Element => {
  const { t } = useTranslation();

  const { isFetched: didFetchExtractorList } = useExtractorsList();
  const { isFetched: didFetchSourceSystems } = useSourceSystems();

  const extractorCount = extractorsList?.length;
  const hostedExtractorCount = hostedExtractorsList?.length;
  const sourceSystemCount = sourceSystems?.length;

  const isLoading = !didFetchExtractorList || !didFetchSourceSystems;
  const totalCount = extractorCount + sourceSystemCount + hostedExtractorCount;

  return (
    <StyledContainer>
      <Title level={6}>{t('categories')}</Title>
      <Flex gap={4} direction="column">
        <CategorySidebarItem
          count={totalCount}
          isLoading={isLoading}
          title={t('all')}
        />
        <CategorySidebarItem
          category="extractor"
          count={extractorCount}
          isLoading={!didFetchExtractorList}
          title={t('extractor_other')}
        />
        <CategorySidebarItem
          category="hosted-extractor"
          count={hostedExtractorCount}
          isLoading={!didFetchExtractorList}
          title={t('hosted-extractor_other')}
        />
        <CategorySidebarItem
          category="source-system"
          count={sourceSystemCount}
          isLoading={!didFetchSourceSystems}
          title={t('source-system_other')}
        />
      </Flex>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 270px;
  width: 270px;
`;

export default CategorySidebar;
