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
  sourceSystems: SourceSystem[];
};

const CategorySidebar = ({
  extractorsList,
  sourceSystems,
}: CategorySidebarProps): JSX.Element => {
  const { t } = useTranslation();

  const { isFetched: didFetchExtractorList } = useExtractorsList();
  const { isFetched: didFetchSourceSystems } = useSourceSystems();

  const extractorCount = extractorsList?.length;
  const sourceSystemCount = sourceSystems?.length;

  const isLoading = !didFetchExtractorList || !didFetchSourceSystems;
  const totalCount = extractorCount + sourceSystemCount;

  return (
    <StyledContainer>
      <Title level={6}>{t('categories')}</Title>
      <Flex gap={4} direction="column">
        <CategorySidebarItem
          isLoading={isLoading}
          tab=""
          count={totalCount}
          title={t('all')}
        />
        <CategorySidebarItem
          count={extractorCount}
          isLoading={!didFetchExtractorList}
          tab="extractor"
          title={t('extractor_other')}
        />
        <CategorySidebarItem
          count={sourceSystemCount}
          isLoading={!didFetchSourceSystems}
          tab="source"
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
