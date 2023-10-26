import React, { useReducer } from 'react';

import styled, { css } from 'styled-components';

import {
  Body,
  Button,
  Checkbox,
  Chip,
  Infobox,
  Overline,
  Skeleton,
  Title,
} from '@cognite/cogs.js';

import { EmptyState } from '../../components/EmptyState';
import { useDataModelsLocalStorage } from '../../hooks/useLocalStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { useListDataModelsQuery } from '../../services/dataModels/query/useListDataModelsQuery';
import { DataModelListResponse } from '../../services/types';

const MAX_DATA_MODELS = 10;

export const DataModelSelector: React.FC = () => {
  const { t } = useTranslation();
  const [, setSelectedDataModels] = useDataModelsLocalStorage();

  const { data: dataModels, isLoading, isError } = useListDataModelsQuery();

  const handleSelectionClick = (item: DataModelListResponse[]) => {
    setSelectedDataModels(item);
  };

  const [selectedDataModels, setSelectedDataModel] = useReducer(
    (acc: DataModelListResponse[], next: DataModelListResponse) => {
      if (acc.includes(next)) {
        return acc.filter((item) => item !== next);
      }

      if (acc.length === MAX_DATA_MODELS) {
        return acc;
      }

      return [...acc, next];
    },
    []
  );

  const isDataModelsEmpty =
    !isLoading && !isError && Boolean(dataModels) && dataModels?.length === 0;

  return (
    <Container data-testid="data-model-selector">
      <Content>
        <InfoContent>
          <Overline level={3}>
            {t('DATA_MODEL_SELECTOR_GET_STARTED_HEADER')}
          </Overline>
          <Title level={4}>{t('DATA_MODEL_SELECTOR_GET_STARTED_TITLE')}</Title>
          <Body level={3}>{t('DATA_MODEL_SELECTOR_GET_STARTED_BODY')}</Body>
        </InfoContent>

        <ListContent>
          {isLoading && <Skeleton.List lines={7} />}
          {isError && (
            <Infobox type="danger" title={t('DATA_MODEL_SELECTOR_ERROR_TITLE')}>
              {t('DATA_MODEL_SELECTOR_ERROR_BODY')}
            </Infobox>
          )}
          {isDataModelsEmpty && (
            <EmptyState
              title={t('DATA_MODEL_SELECTOR_EMPTY_TITLE')}
              body={t('DATA_MODEL_SELECTOR_EMPTY_BODY')}
              centerVertically
            />
          )}
          {dataModels?.map((item) => {
            const isSelected = selectedDataModels.includes(item);
            return (
              <Card
                data-testid={`data-model-${item.name}-${item.version}-${item.space}`}
                key={`${item.externalId}-${item.space}`}
                onClick={() => setSelectedDataModel(item)}
                isSelected={isSelected}
              >
                <Chip icon="Versions" />
                <CardContent>
                  <Body strong>{item.name}</Body>
                  <Body level={2}>
                    {item.description || 'No description...'}
                  </Body>
                  <Body level={3}>
                    v.{item.version} • {item.space}
                  </Body>
                </CardContent>
                <CheckboxWrapper checked={isSelected} />
              </Card>
            );
          })}
        </ListContent>
      </Content>
      <ActionContainer>
        <Body level={3}>
          {t('DATA_MODEL_SELECTED_DATA_MODELS', {
            selectedDataModelsLength: selectedDataModels.length,
            maxDataModels: MAX_DATA_MODELS,
          })}
        </Body>
        <Button
          type="primary"
          icon="ArrowRight"
          iconPlacement="right"
          disabled={selectedDataModels.length === 0}
          onClick={() => handleSelectionClick(selectedDataModels)}
        >
          {t('DATA_MODEL_SELECTOR_GET_STARTED_CONFIRM_BUTTON')}
        </Button>
      </ActionContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--default-bg-color);
  height: calc(100% - var(--top-bar-height));
  box-shadow: 0px 1px 1px 1px rgba(79, 82, 104, 0.06),
    0px 1px 2px 1px rgba(79, 82, 104, 0.04);
`;

const Content = styled.div`
  height: 512px;
  width: 680px;
  display: flex;
  border-radius: 8px;
`;

const InfoContent = styled.div`
  min-width: 256px;
  max-width: 256px;
  background-color: rgba(83, 88, 127, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  & > * {
    line-height: 24px;
  }
  border-top-left-radius: 10px;
`;

const ActionContainer = styled.div`
  background-color: white;
  height: 68px;
  width: 680px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid rgba(83, 88, 127, 0.16);

  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;

const ListContent = styled.div`
  background-color: white;
  padding: 16px;
  width: 100%;
  overflow: auto;

  border-top-right-radius: 10px;
`;

const Card = styled.div<{ isSelected: boolean }>`
  display: flex;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;

  ${(props) =>
    props.isSelected &&
    css`
      background-color: var(
        --surface-interactive-toggled-default,
        rgba(74, 103, 251, 0.08)
      ) !important;
    `}

  &:hover {
    background-color: var(--cogs-surface--interactive--hover);
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CheckboxWrapper = styled(Checkbox)`
  margin-left: auto;
  align-self: center;
`;
