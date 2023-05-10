import {
  Body,
  Button,
  Chip,
  Overline,
  Skeleton,
  Title,
} from '@cognite/cogs.js';
import { useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import { DataModelList } from '../../services/FDMClient';

interface Props {
  loading?: boolean;
  dataModels?: DataModelList[];
  onSelectionClick?: (dataModel: DataModelList) => void;
}

export const DataModelSelector: React.FC<Props> = ({
  loading,
  dataModels,
  onSelectionClick,
}) => {
  const { t } = useTranslation();

  const [selectedDataModel, setSelectedDataModel] = useState<
    DataModelList | undefined
  >();

  return (
    <Container>
      <Content>
        <InfoContent>
          <Overline level={3}>
            {t('get_started_header', 'Get started')}
          </Overline>
          <Title level={4}>
            {t(
              'get_started_title',
              'Get started working with your data right now by selecting a Data Model'
            )}
          </Title>
          <Body level={3}>
            {t(
              'get_started_body',
              'Cognite Data Fusion has a large range of possibilities, we recommend starting testing one of the following.'
            )}
          </Body>
        </InfoContent>
        <ListContent>
          {loading && <Skeleton.List lines={7} />}
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
          {t('get_started_confirm', 'Confirm')}
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
  height: 100%;
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
