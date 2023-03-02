import { Button, Flex, Icon } from '@cognite/cogs.js';
import { Select } from 'antd';
import ResourceTypei18n from 'components/resource-type-i18n';
import {
  ModelMapping,
  SourceType,
  TargetType,
} from 'context/QuickMatchContext';
import { useAggregateProperties } from 'hooks/aggregates';
import { Dispatch, SetStateAction } from 'react';

const { Option } = Select;

type Props = {
  sourceType: SourceType;
  targetType: TargetType;
  modelFieldMapping: ModelMapping;
  setModelFieldMapping: Dispatch<SetStateAction<ModelMapping>>;
};
export default function FieldMapping({
  sourceType,
  targetType,
  modelFieldMapping,
  setModelFieldMapping,
}: Props) {
  const { data: sourceProps, isInitialLoading: sourcesLoading } =
    useAggregateProperties(sourceType);
  const { data: targetProps, isInitialLoading: targetsLoading } =
    useAggregateProperties(targetType);

  return (
    <Flex direction="column">
      <Flex justifyContent="space-around">
        <div>
          <ResourceTypei18n t={sourceType} />
        </div>
        <div>
          <ResourceTypei18n t={targetType} />
        </div>
      </Flex>
      {modelFieldMapping.map(({ source: from, target: to }, i) => (
        <Flex key={`${i}`} gap={12} alignItems="center">
          <Select
            loading={sourcesLoading}
            style={{ width: 400 }}
            value={from}
            onChange={(e) => {
              modelFieldMapping[i].source = e;
              setModelFieldMapping(modelFieldMapping);
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
          <Icon type="ArrowRight" />
          <Select
            style={{ width: 400 }}
            loading={targetsLoading}
            value={to}
            onChange={(e) => {
              modelFieldMapping[i].target = e;
              setModelFieldMapping(modelFieldMapping);
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
            icon="Delete"
            onClick={() => {
              setModelFieldMapping([
                ...modelFieldMapping.splice(0, i),
                ...modelFieldMapping.splice(i + 1),
              ]);
            }}
          />
        </Flex>
      ))}
      <Button
        icon="Add"
        onClick={() => {
          setModelFieldMapping([
            ...modelFieldMapping,
            { source: undefined, target: undefined },
          ]);
        }}
      />
    </Flex>
  );
}
