import { Flex } from '@cognite/cogs.js';
import { Select } from 'antd';

import { useTranslation } from 'common';
import QuickMatchTitle from 'components/quick-match-title';
import { Pipeline, useUpdatePipeline } from 'hooks/contextualization-api';
import { SourceType } from 'types/api';

const { Option } = Select;

type SourcesProps = {
  pipeline: Pipeline;
};

const Sources = ({ pipeline }: SourcesProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutate } = useUpdatePipeline();

  const sourceTypeOptions: { value: SourceType; label: string }[] = [
    { value: 'timeseries', label: t('resource-type-ts') },
    { value: 'events', label: t('resource-type-events', { count: 0 }) },
    { value: 'files', label: t('resource-type-files', { count: 0 }) },
    { value: 'sequences', label: t('resource-type-sequences', { count: 0 }) },
  ];

  const handleChangeSelectSourceType = (selectedSourceType: string): void => {
    mutate({
      id: pipeline.id,
      sources: {
        dataSetIds: [],
        resource: selectedSourceType,
      },
    });
  };

  return (
    <Flex direction="column" gap={8}>
      <QuickMatchTitle step="select-sources" />
      <Flex justifyContent="space-between">
        <Select
          defaultValue="timeseries"
          onChange={handleChangeSelectSourceType}
          style={{ width: 200 }}
          value={pipeline.sources.resource}
        >
          {sourceTypeOptions.map(({ label, value }) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Select>
      </Flex>
    </Flex>
  );
};

export default Sources;
