import React, { useState } from 'react';

import styled, { css } from 'styled-components';

import {
  Body,
  Button,
  Chip,
  Infobox,
  Overline,
  Skeleton,
  Title,
} from '@cognite/cogs.js';

import { translationKeys } from '../../common/i18n/translationKeys';
import { useTranslation } from '../../hooks/useTranslation';
import { DataModelListResponse } from '../../services/types';

interface Props {
  loading?: boolean;
  isError?: boolean;
  dataModels?: DataModelListResponse[];
  onSelectionClick?: (dataModel: DataModelListResponse) => void;
}

const Sidebar = React.memo(() => {
  const { t } = useTranslation();
  return (
    <InfoContent>
      <Overline level={3}>
        {t(translationKeys.dataModelSelectorGetStartedHeader, 'Get started')}
      </Overline>
      <Title level={4}>
        {t(
          translationKeys.dataModelSelectorGetStartedTitle,
          'Get started working with your data right now by selecting a Data Model'
        )}
      </Title>
      <Body level={3}>
        {t(
          translationKeys.dataModelSelectorGetStartedBody,
          'Cognite Data Fusion has a large range of possibilities, we recommend starting testing one of the following.'
        )}
      </Body>
    </InfoContent>
  );
});

export const DataModelSelector: React.FC<Props> = ({
  loading,
  isError,
  dataModels,
  onSelectionClick,
}) => {
  const { t } = useTranslation();

  const [selectedDataModel, setSelectedDataModel] = useState<
    DataModelListResponse | undefined
  >();

  const isDataModelsEmpty =
    !loading && !isError && Boolean(dataModels) && dataModels?.length === 0;

  return (
    <Container>
      <Content>
        <Sidebar />
        <ListContent>
          {loading && <Skeleton.List lines={7} />}
          {isError && (
            <Infobox
              type="danger"
              title={t(
                translationKeys.dataModelSelectorInfoboxDangerTitle,
                'Error'
              )}
            >
              {t(
                translationKeys.dataModelSelectorInfoboxDangerBody,
                'There were some struggles to fetch data models.'
              )}
            </Infobox>
          )}
          {isDataModelsEmpty && (
            <Infobox
              type="neutral"
              title={t(
                translationKeys.dataModelSelectorInfoboxNeutralTitle,
                'Add a Data Model'
              )}
            >
              {t(
                translationKeys.dataModelSelectorInfoboxNeutralBody,
                'Please add a Data Model first to start exploring.'
              )}
            </Infobox>
          )}
          {dataModels?.map((item) => (
            <Card
              key={`${item.externalId}-${item.space}`}
              onClick={() => setSelectedDataModel(item)}
              isSelected={item === selectedDataModel}
            >
              <Chip icon="Versions" />
              <CardContent>
                <Body strong>{item.name}</Body>
                <Body level={2}>{item.description || 'No description...'}</Body>
                <Body level={3}>
                  v.{item.version} • {item.space}
                </Body>
              </CardContent>
            </Card>
          ))}
        </ListContent>
      </Content>
      <ActionContainer>
        <Button
          type="primary"
          icon="ArrowRight"
          iconPlacement="right"
          disabled={!selectedDataModel}
          onClick={() => onSelectionClick?.(selectedDataModel!)}
        >
          {t(translationKeys.dataModelSelectorGetStartedConfirm, 'Confirm')}
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
  justify-content: flex-end;
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
      background-color: var(--cogs-surface--interactive--pressed) !important;
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
