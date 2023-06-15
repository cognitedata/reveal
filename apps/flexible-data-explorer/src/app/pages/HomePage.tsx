import { useCallback, useState } from 'react';

import styled from 'styled-components';

import { Body, Icon, Title } from '@cognite/cogs.js';

import { translationKeys } from '../../app/common/i18n/translationKeys';
import { CategoryCard } from '../components/cards/CategoryCard';
import { DataModelSelectorModal } from '../containers/modals/DataModelSelectorModal';
import { Page } from '../containers/page/Page';
import { SearchBar } from '../containers/search/SearchBar';
import { useDataModelParams } from '../hooks/useDataModelParams';
import { useNavigation } from '../hooks/useNavigation';
import { useTranslation } from '../hooks/useTranslation';
import { useTypesDataModelQuery } from '../services/dataModels/query/useTypesDataModelQuery';

export const HomePage = () => {
  const { t } = useTranslation();

  const { toListPage } = useNavigation();

  const { data, isLoading } = useTypesDataModelQuery();
  const selectedDataModel = useDataModelParams();

  const [siteSelectionVisible, setSiteSelectionVisible] =
    useState<boolean>(false);

  const handleCategoryClick = useCallback(
    (dataType: string) => {
      if (selectedDataModel) {
        toListPage(
          selectedDataModel.space,
          selectedDataModel.dataModel,
          selectedDataModel.version,
          dataType
        );
      }
    },
    [toListPage, selectedDataModel]
  );

  const getSpaceText = () => {
    if (selectedDataModel && selectedDataModel.dataModel) {
      return selectedDataModel.dataModel;
    } else {
      return '...';
    }
  };

  return (
    <Page>
      <SearchContainer>
        <TitleContainer>
          <Title level={3}>
            {t(translationKeys.homePageTitle, 'Explore all your data from')}{' '}
          </Title>
          <StyledBody onClick={() => setSiteSelectionVisible(true)}>
            {getSpaceText()}
            {selectedDataModel && selectedDataModel.dataModel && (
              <Icon type="ChevronDownLarge" />
            )}
          </StyledBody>
        </TitleContainer>
        <SearchBar width="640px" />
      </SearchContainer>

      <Page.Body loading={isLoading}>
        <CategoriesContainer>
          <Title level={4}>
            {t('categories_title', 'Categories')} {data?.length}
          </Title>

          <CategoryContent>
            {data?.map((item) => (
              <CategoryCard
                key={item.name}
                type={item.name}
                description={item.description}
                onClick={handleCategoryClick}
              />
            ))}
          </CategoryContent>
        </CategoriesContainer>
      </Page.Body>

      <DataModelSelectorModal
        isVisible={siteSelectionVisible}
        onModalClose={() => setSiteSelectionVisible(false)}
        isClosable
      />
    </Page>
  );
};

const TitleContainer = styled.span`
  display: flex;
  align-items: center;
`;

const StyledBody = styled(Body)`
  display: flex;
  align-items: center;
  font-size: 24px;
  color: rgba(51, 51, 51, 0.8);
  margin-left: 8px;

  &:hover {
    cursor: pointer;
    color: rgba(51, 51, 51, 0.5);
  }

  .cogs-icon {
    margin-left: 8px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 70vh;
  background-color: radial-gradient(
    62.29% 135.84% at 0% 0%,
    rgba(10, 119, 247, 0.1024) 0%,
    rgba(10, 119, 246, 0) 100%
  );

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

const CategoriesContainer = styled.div`
  height: 10%;
  padding-top: 24px;
`;

const CategoryContent = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;

  padding: 16px 0;
`;
