import React from 'react';

import { Flex, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import CategorySidebarItem from './CategorySidebarItem';

const CategorySidebar = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <StyledContainer>
      <Title level={6}>{t('categories')}</Title>
      <Flex gap={4} direction="column">
        <CategorySidebarItem count={5} title={t('all')} />
        <CategorySidebarItem tab="extractors" title={t('extractors')} />
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
