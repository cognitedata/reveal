import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { TableRowSelection } from 'antd/lib/table/interface';

import { ColumnType, Table, Timestamp } from '@cognite/cdf-utilities';
import {
  Body,
  Chip,
  Colors,
  Flex,
  Icon,
  InputExp,
  Switch,
} from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';

import { useTranslation } from '../../../../common';
import {
  PAGINATION_SETTINGS,
  SOURCE_TABLE_QUERY_KEY,
} from '../../../../common/constants';
import ResourceCount from '../../../../components/resource-count';
import Step from '../../../../components/step';
import { useAllDataSets, useDataSets } from '../../../../hooks/datasets';
import {
  useUpdatePipeline,
  Pipeline,
} from '../../../../hooks/entity-matching-pipelines';
import { pipelineSourceTypeToSourceType } from '../../../../types/api';

type PipelineTargetTableRecord = { key: string } & DataSet;
type PipelineTargetTableColumnType = ColumnType<PipelineTargetTableRecord> & {
  title: string;
  key: string;
};

type TargetsProps = {
  pipeline: Pipeline;
};

const Targets = ({ pipeline }: TargetsProps): JSX.Element => {
  const { t } = useTranslation();

  const [
    shouldShowOnlyDataSetsContainingResourceType,
    setShouldShowOnlyDataSetsContainingResourceType,
  ] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get(SOURCE_TABLE_QUERY_KEY) ?? '';

  const { mutate } = useUpdatePipeline();

  const { data: dataSetsWithOutResourceCount } = useAllDataSets();

  const { data: dataSetsWithResourceCount, isInitialLoading } =
    useDataSets('assets');

  const dataSets = shouldShowOnlyDataSetsContainingResourceType
    ? dataSetsWithResourceCount
    : dataSetsWithOutResourceCount;

  const handleChangeSelectedDataSetIds = (
    selectedDataSetIds: number[]
  ): void => {
    mutate({
      id: pipeline.id,
      targets: {
        ...pipeline.targets,
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

  const columns: PipelineTargetTableColumnType[] = useMemo(
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
                  icon="Assets"
                  label={t(`assets-with-count`, {
                    count: value,
                  })}
                  size="x-small"
                />
              ),
            },
          ]
        : []),
    ],
    [t, shouldShowOnlyDataSetsContainingResourceType]
  );

  const rowSelection: TableRowSelection<PipelineTargetTableRecord> = {
    selectedRowKeys: pipeline.targets.dataSetIds.map(({ id }) => id.toString()),
    onChange: (_, rows, info) => {
      if (info.type === 'single') {
        const idsAsNumberArr = rows.map(({ key }) => parseInt(key));
        handleChangeSelectedDataSetIds(idsAsNumberArr);
      }
    },
    onSelectAll: (all) => {
      if (all) {
        handleChangeSelectedDataSetIds(filteredDataSource.map(({ id }) => id));
      } else {
        handleChangeSelectedDataSetIds([]);
      }
    },
  };

  const filteredDataSource = useMemo(() => {
    return dataSource.filter(({ externalId, id, name }) => {
      const lowerCaseQuery = query.toLowerCase();
      return (
        name?.toLowerCase().includes(lowerCaseQuery) ||
        externalId?.toLowerCase().includes(lowerCaseQuery) ||
        `${id}`?.toLowerCase().includes(lowerCaseQuery)
      );
    });
  }, [dataSource, query]);

  return (
    <Step
      subtitle={t('select-target-step-subtitle')}
      title={t('select-target-step-title', { step: 2 })}
    >
      <Flex direction="column" gap={16}>
        <Flex alignItems="center" gap={12} justifyContent="space-between">
          <Flex alignItems="center" gap={12}>
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
              label={t(`only-data-sets-containing-assets`)}
            />
          </Flex>
          {pipeline.targets.dataSetIds.length > 0 && (
            <MutedBody>
              <ResourceCount
                type={pipelineSourceTypeToSourceType(pipeline.targets.resource)}
                filter={{
                  dataSetIds: pipeline.targets.dataSetIds,
                }}
              />
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
        dataSource={filteredDataSource}
        pagination={PAGINATION_SETTINGS}
      />
    </Step>
  );
};

const MutedBody = styled(Body).attrs({ level: 2 })`
  color: ${Colors['text-icon--muted']};
`;

export default Targets;
