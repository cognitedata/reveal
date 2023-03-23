import {
  Body,
  Chip,
  Colors,
  Flex,
  Icon,
  IconType,
  InputExp,
  Switch,
  toast,
} from '@cognite/cogs.js';
import { Select } from 'antd';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { useTranslation } from 'common';
import { SOURCE_TABLE_QUERY_KEY } from 'common/constants';
import { API, PipelineSourceType } from 'types/api';
import Step from 'components/step';
import { useMemo, useState } from 'react';
import { ColumnType, Table, Timestamp } from '@cognite/cdf-utilities';
import { DataSet } from '@cognite/sdk';
import { useAllDataSets, useDataSets } from 'hooks/datasets';
import { Pipeline, useUpdatePipeline } from 'hooks/entity-matching-pipelines';

const { Option } = Select;

type PipelineSourceTableRecord = { key: string } & DataSet;
type PipelineSourceTableColumnType = ColumnType<PipelineSourceTableRecord> & {
  title: string;
  key: string;
};

const pipelineSourceToAPIType: Record<PipelineSourceType, API> = {
  events: 'events',
  files: 'files',
  sequences: 'sequences',
  time_series: 'timeseries',
};

const pipelineSourceToIconType: Record<PipelineSourceType, IconType> = {
  events: 'Events',
  files: 'Document',
  sequences: 'Sequences',
  time_series: 'Timeseries',
};

type SourcesProps = {
  pipeline: Pipeline;
};

const Sources = ({ pipeline }: SourcesProps): JSX.Element => {
  const { t } = useTranslation();

  const [
    shouldShowOnlyDataSetsContainingResourceType,
    setShouldShowOnlyDataSetsContainingResourceType,
  ] = useState(true);

  const { data: dataSetsWithOutResourceCount } = useAllDataSets();

  const { data: dataSetsWithResourceCount, isInitialLoading } = useDataSets(
    pipelineSourceToAPIType[pipeline.sources.resource]
  );

  const dataSets = shouldShowOnlyDataSetsContainingResourceType
    ? dataSetsWithResourceCount
    : dataSetsWithOutResourceCount;

  const [searchParams, setSearchParams] = useSearchParams();

  const { mutateAsync } = useUpdatePipeline();

  const sourceTypeOptions: {
    value: PipelineSourceType;
    label: string;
    icon: IconType;
  }[] = [
    { value: 'time_series', label: t('resource-type-ts'), icon: 'Timeseries' },
    {
      value: 'events',
      label: t('resource-type-events', { count: 0 }),
      icon: 'Events',
    },
    {
      value: 'files',
      label: t('resource-type-files', { count: 0 }),
      icon: 'Document',
    },
    {
      value: 'sequences',
      label: t('resource-type-sequences', { count: 0 }),
      icon: 'Sequences',
    },
  ];

  const query = searchParams.get(SOURCE_TABLE_QUERY_KEY) ?? '';

  const handleChangeSelectSourceType = (
    selectedSourceType: PipelineSourceType
  ): void => {
    mutateAsync({
      id: pipeline.id,
      sources: {
        dataSetIds: [],
        resource: selectedSourceType,
      },
    }).catch((error) => {
      toast.error(
        t('cannot-select-resource-type-as-source', {
          error: error.message,
          resourceType: selectedSourceType,
        }),
        {
          toastId: `cannot-select-resource-type-as-source-${pipeline.id}`,
        }
      );
    });
  };

  const handleChangeSelectedDataSetIds = (
    selectedDataSetIds: number[]
  ): void => {
    mutateAsync({
      id: pipeline.id,
      sources: {
        ...pipeline.sources,
        dataSetIds: selectedDataSetIds.map((id) => ({ id })),
      },
    });
  };

  const dataSource = useMemo(
    () =>
      dataSets?.map((a) => ({
        ...a,
        key: a.id.toString(),
      })) || [],
    [dataSets]
  );

  const columns: PipelineSourceTableColumnType[] = useMemo(
    () => [
      {
        title: t('resource-table-column-name'),
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => record.name ?? record.externalId ?? record.id,
      },
      {
        title: t('resource-table-column-lastUpdated'),
        dataIndex: 'lastUpdatedTime',
        key: 'lastUpdatedTime',
        render: (value: number) => <Timestamp timestamp={value} />,
      },
      ...(shouldShowOnlyDataSetsContainingResourceType
        ? [
            {
              title: t('resource-count'),
              dataIndex: 'count',
              key: 'count',
              render: (value: number) => (
                <Chip
                  icon={pipelineSourceToIconType[pipeline.sources.resource]}
                  label={t(`${pipeline.sources.resource}-with-count`, {
                    count: value,
                  })}
                  size="x-small"
                />
              ),
            },
          ]
        : []),
    ],
    [t, pipeline.sources.resource, shouldShowOnlyDataSetsContainingResourceType]
  );

  const rowSelection = {
    selectedRowKeys: pipeline.sources.dataSetIds.map(({ id }) => id.toString()),
    onChange: (_: unknown, rows: PipelineSourceTableRecord[]) => {
      const idsAsNumberArr = rows.map(({ key }) => parseInt(key));
      handleChangeSelectedDataSetIds(idsAsNumberArr);
    },
    hideSelectAll: true,
  };

  return (
    <Step
      subtitle={t('select-source-step-subtitle')}
      title={t('select-source-step-title', { step: 1 })}
    >
      <Flex direction="column" gap={16}>
        <Flex alignItems="center" gap={12} justifyContent="space-between">
          <Flex alignItems="center" gap={12}>
            <Select
              onChange={handleChangeSelectSourceType}
              style={{ width: 200 }}
              value={pipeline.sources.resource}
            >
              {sourceTypeOptions.map(({ icon, label, value }) => (
                <Option key={value} value={value}>
                  <Container>
                    <Icon type={icon} />
                    <Body level={2}>{label}</Body>
                  </Container>
                </Option>
              ))}
            </Select>
            <InputExp
              icon="Search"
              onChange={(e) => {
                searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
                setSearchParams(searchParams);
              }}
              placeholder={t('search-data-sets')}
              value={query}
            />
            <Switch
              checked={shouldShowOnlyDataSetsContainingResourceType}
              onChange={() => {
                setShouldShowOnlyDataSetsContainingResourceType(
                  (prevState) => !prevState
                );
              }}
              label={t(
                `only-data-sets-containing-${pipeline.sources.resource}`
              )}
            />
          </Flex>
          {pipeline.sources.dataSetIds.length > 0 && (
            <MutedBody>
              {t('resource-selected-with-count', {
                resourceWithCount: t(
                  `${pipeline.sources.resource}-with-count`,
                  {
                    count: pipeline.sources.dataSetIds.length,
                  }
                ),
              })}
            </MutedBody>
          )}
        </Flex>
      </Flex>
      <Table<any> // FIXME
        loading={isInitialLoading}
        columns={columns}
        emptyContent={isInitialLoading ? <Icon type="Loader" /> : undefined}
        appendTooltipTo={undefined}
        rowSelection={rowSelection}
        dataSource={dataSource}
        pagination={{ defaultPageSize: 10 }}
      />
    </Step>
  );
};

const Container = styled(Flex).attrs({ alignItems: 'center', gap: 8 })`
  height: 100%;
`;

const MutedBody = styled(Body).attrs({ level: 2 })`
  color: ${Colors['text-icon--muted']};
`;

export default Sources;
