import React from 'react';

import { Flex, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import CategorySidebarItem from './CategorySidebarItem';
import { useExtractorsList } from 'hooks/useExtractorsList';

const CategorySidebar = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: extractors, isFetched: didFetchExtractorList } =
    useExtractorsList();

  const extractorCount = extractors?.length;
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
          title={t('extractors')}
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
