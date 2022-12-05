import React from 'react';

import { Flex, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import CategorySidebarItem from './CategorySidebarItem';
import { useExtractorsList } from 'hooks/useExtractorsList';
import { ExtractorWithReleases } from 'service/extractors';

type CategorySidebarProps = {
  extractorsList: ExtractorWithReleases[];
};

const CategorySidebar = ({
  extractorsList,
}: CategorySidebarProps): JSX.Element => {
  const { t } = useTranslation();

  const { isFetched: didFetchExtractorList } = useExtractorsList();

  const extractorCount = extractorsList?.length;
  const isLoading = !didFetchExtractorList;
  const totalCount = extractorCount;

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
          tab="extractors"
          title={t('extractor_other')}
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
