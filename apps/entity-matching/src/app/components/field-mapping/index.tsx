import styled from 'styled-components';

import { Select } from 'antd';

import { Body, Button, IconType, Flex, Icon } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { ModelMapping } from '../../context/QuickMatchContext';
import { useAggregateProperties } from '../../hooks/aggregates';
import { SourceType, TargetType } from '../../types/api';
import ResourceTypei18n from '../resource-type-i18n';

const { Option } = Select;

const resourceTypeToIconType: Record<SourceType | TargetType, IconType> = {
  assets: 'Assets',
  events: 'Events',
  files: 'Documents',
  sequences: 'Sequences',
  threeD: 'Cube',
  timeseries: 'Timeseries',
};

type Props = {
  sourceType: SourceType;
  targetType: TargetType;
  modelFieldMapping: ModelMapping;
  setModelFieldMapping: (mapping: ModelMapping) => void;
};
export default function FieldMapping({
  sourceType,
  targetType,
  modelFieldMapping,
  setModelFieldMapping,
}: Props) {
  const { t } = useTranslation();

  const { data: sourceProps, isInitialLoading: sourcesLoading } =
    useAggregateProperties(sourceType);
  const { data: targetProps, isInitialLoading: targetsLoading } =
    useAggregateProperties(targetType);

  return (
    <Container>
      <Flex gap={8}>
        <Flex alignItems="center" gap={4} style={{ flex: 1 }}>
          <Icon type={resourceTypeToIconType[sourceType]} />
          <ResourceTypeTitle>
            <ResourceTypei18n t={sourceType} />
          </ResourceTypeTitle>
        </Flex>
        <Flex alignItems="center" gap={4} style={{ flex: 1 }}>
          <Icon type={resourceTypeToIconType[targetType]} />
          <ResourceTypeTitle>
            <ResourceTypei18n t={targetType} />
          </ResourceTypeTitle>
        </Flex>
      </Flex>
      <Flex gap={8} direction="column">
        {modelFieldMapping.map(({ source: from, target: to }, i) => (
          <Flex key={`${i}`} gap={8} alignItems="center">
            <Select
              loading={sourcesLoading}
              style={{ flex: 1 }}
              value={from}
              onChange={(e) => {
                const nextState = [...modelFieldMapping];
                nextState[i].source = e;
                setModelFieldMapping(nextState);
              }}
            >
              {sourceProps?.map((s) => (
                <Option
                  key={JSON.stringify(s)}
                  value={s.values[0]?.property.join('.')}
                >
                  {s.values[0]?.property.join('.')}
                </Option>
              ))}
            </Select>
            <IconContainer>
              <Icon type="ArrowRight" />
            </IconContainer>
            <Select
              style={{ flex: 1 }}
              loading={targetsLoading}
              value={to}
              onChange={(e) => {
                const nextState = [...modelFieldMapping];
                nextState[i].target = e;
                setModelFieldMapping(nextState);
              }}
            >
              {targetProps?.map((s) => (
                <Option
                  key={JSON.stringify(s)}
                  value={s.values[0]?.property.join('.')}
                >
                  {s.values[0]?.property.join('.')}
                </Option>
              ))}
            </Select>
            <Button
              disabled={modelFieldMapping.length === 1}
              icon="Delete"
              onClick={() => {
                setModelFieldMapping([
                  ...modelFieldMapping.splice(0, i),
                  ...modelFieldMapping.splice(i + 1),
                ]);
              }}
              type="ghost"
            />
          </Flex>
        ))}
        <div>
          <Button
            icon="Add"
            onClick={() => {
              setModelFieldMapping([
                ...modelFieldMapping,
                { source: undefined, target: undefined },
              ]);
            }}
            type="ghost-accent"
          >
            {t('add-connection')}
          </Button>
        </div>
      </Flex>
    </Container>
  );
}

const Container = styled(Flex).attrs({ direction: 'column', gap: 6 })`
  width: 100%;
`;

const IconContainer = styled(Flex).attrs({ justifyContent: 'center' })`
  width: 36px;
`;

const ResourceTypeTitle = styled(Body).attrs({ level: 2, strong: true })``;
