import { useParams } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { Body, Title as CogsTitle } from '@cognite/cogs.js';

import { useNavigation } from '../../hooks/useNavigation';
import { useTranslation } from '../../hooks/useTranslation';
import { useTypesDataModelQuery } from '../../services/dataModels/query/useTypesDataModelQuery';

export const SearchCategories = () => {
  const navigate = useNavigation();
  const { dataType } = useParams();
  const { t } = useTranslation();

  const { data: types } = useTypesDataModelQuery();

  const handleSelectionClick = (name?: string) => {
    navigate.redirectSearchPage(name);
  };

  return (
    <Container>
      <Title level={6}>{t('SEARCH_CATEGORIES_HEADER')}</Title>

      <Content
        selected={dataType === undefined}
        onClick={() => handleSelectionClick(undefined)}
      >
        <NameText>{t('SEARCH_CATEGORIES_ALL_OPTION')}</NameText>
      </Content>

      {types?.map((type) => (
        <Content
          key={type.name}
          selected={dataType === type.name}
          onClick={() => handleSelectionClick(type.name)}
        >
          <NameText>{type.name}</NameText>
        </Content>
      ))}

      {/* TODO: Find a better way of managing the built in (CDF) data types */}
      <Content
        selected={dataType === 'Timeseries'}
        onClick={() => handleSelectionClick('Timeseries')}
      >
        <NameText>Time series</NameText>
      </Content>

      <Content
        selected={dataType === 'Files'}
        onClick={() => handleSelectionClick('Files')}
      >
        <NameText>File</NameText>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  max-width: 200px;
  width: 100%;
  position: sticky;
  top: 0;
`;

const Title = styled(CogsTitle)`
  margin-bottom: 16px;
`;

const Content = styled.div<{ selected?: boolean }>`
  height: 32;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  cursor: pointer;
  user-selection: none;

  ${({ selected }) =>
    selected &&
    css`
      background: rgba(59, 130, 246, 0.08);
      & > * {
        color: #3b82f6 !important;
        font-weight: 600;
      }
    `}

  &:hover {
    background: rgba(59, 130, 246, 0.08);
  }
`;

const NameText = styled(Body).attrs({ level: 2 })``;
