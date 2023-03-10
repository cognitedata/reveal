import { Flex, InputNew } from '@cognite/cogs.js';
import { Select } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'common';
import { SOURCE_TABLE_QUERY_KEY } from 'common/constants';
import QuickMatchTitle from 'components/quick-match-title';
import { Pipeline, useUpdatePipeline } from 'hooks/contextualization-api';
import { SourceType } from 'types/api';

const { Option } = Select;

type SourcesProps = {
  pipeline: Pipeline;
};

const Sources = ({ pipeline }: SourcesProps): JSX.Element => {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const { mutate } = useUpdatePipeline();

  const sourceTypeOptions: { value: SourceType; label: string }[] = [
    { value: 'timeseries', label: t('resource-type-ts') },
    { value: 'events', label: t('resource-type-events', { count: 0 }) },
    { value: 'files', label: t('resource-type-files', { count: 0 }) },
    { value: 'sequences', label: t('resource-type-sequences', { count: 0 }) },
  ];

  const query = searchParams.get(SOURCE_TABLE_QUERY_KEY);

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
      <Flex gap={12}>
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
        <InputNew
          icon="Search"
          onChange={(e) => {
            searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
            setSearchParams(searchParams);
          }}
          placeholder={t('search-data-sets')}
          value={query}
        />
      </Flex>
    </Flex>
  );
};

export default Sources;
