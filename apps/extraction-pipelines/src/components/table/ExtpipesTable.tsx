import React, { useMemo } from 'react';
import { Loader } from '@cognite/cogs.js';
import {
  ColumnType,
  SortOrder,
  Table,
  TableNoResults,
} from '@cognite/cdf-utilities';
import { Extpipe } from '@extraction-pipelines/model/Extpipe';
import { useAllExtpipes } from '@extraction-pipelines/hooks/useExtpipes';
import { useTranslation } from '@extraction-pipelines/common';
import {
  dateSorter,
  getContainer,
  stringSorter,
} from '@extraction-pipelines/utils/utils';

import { LastRunStatusMarker } from '@extraction-pipelines/components/extpipes/cols/StatusMarker';
import RelativeTimeWithTooltip from '@extraction-pipelines/components/extpipes/cols/RelativeTimeWithTooltip';
import {
  addIfExist,
  calculateLatest,
} from '@extraction-pipelines/utils/extpipeUtils';
import Schedule from '@extraction-pipelines/components/extpipes/cols/Schedule';
import { DataSet } from '@extraction-pipelines/components/extpipes/cols/DataSet';
import { User } from '@extraction-pipelines/model/User';
import ExtractionPipelineName from '@extraction-pipelines/components/extpipes/cols/ExtractionPipelineName';
import { useDataSetList } from '@extraction-pipelines/hooks/dataSet';

export type ExtractionPipelineListTableRecord = {
  key: number;
  lastConnected: number;
  latestRun: number;
  owner?: User;
} & Pick<
  Extpipe,
  'dataSetId' | 'externalId' | 'id' | 'lastUpdatedTime' | 'name' | 'schedule'
>;

type ExtpipesTableProps = {
  search?: string;
};

const ExtpipesTable = ({ search }: ExtpipesTableProps): JSX.Element => {
  const { t } = useTranslation();

  const { data, hasNextPage, isFetched } = useAllExtpipes();

  const { data: dataSets } = useDataSetList();

  const extractionPipelines = useMemo(() => {
    const list = data?.pages
      .reduce((accl, p) => [...accl, ...p.items], [] as Extpipe[])
      .map(
        ({
          contacts,
          dataSetId,
          externalId,
          id,
          lastFailure,
          lastSeen,
          lastSuccess,
          lastUpdatedTime,
          name,
          schedule,
        }) => ({
          contacts,
          dataSetId,
          externalId,
          id,
          key: id,
          lastConnected: calculateLatest([
            ...addIfExist(lastSuccess),
            ...addIfExist(lastFailure),
            ...addIfExist(lastSeen),
          ]),
          lastFailure,
          lastSeen,
          lastSuccess,
          lastUpdatedTime,
          latestRun: calculateLatest([
            ...addIfExist(lastSuccess),
            ...addIfExist(lastFailure),
          ]),
          name,
          owner: contacts?.find((user) => user.role?.toLowerCase() === 'owner'),
          schedule,
        })
      );
    return list ?? ([] as ExtractionPipelineListTableRecord[]);
  }, [data?.pages]);

  const filteredExtractionPipelines = useMemo(() => {
    return extractionPipelines.filter(({ name }) =>
      name.toLowerCase().includes(search?.toLowerCase() ?? '')
    );
  }, [extractionPipelines, search]);

  const defaultSort: [string, SortOrder] = ['last-modified', 'descend'];

  const columns: (ColumnType<ExtractionPipelineListTableRecord> & {
    title: string;
  })[] = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      render: (value: string, record) => (
        <ExtractionPipelineName name={value} id={record.id} />
      ),
      sorter: (recordA, recordB) => stringSorter(recordA.name, recordB.name),
    },
    {
      title: t('last-run'),
      dataIndex: 'externalId',
      key: 'last-run',
      render: (value: string) => <LastRunStatusMarker externalId={value} />,
      sorter: (recordA, recordB) =>
        dateSorter(recordA.latestRun, recordB.latestRun),
    },
    {
      title: t('last-seen'),
      dataIndex: 'lastConnected',
      key: 'last-seen',
      render: (value: number) => {
        return !!value ? (
          <RelativeTimeWithTooltip id="last-seen" time={value} />
        ) : (
          '-'
        );
      },
      sorter: (recordA, recordB) =>
        dateSorter(recordA.lastConnected, recordB.lastConnected),
    },
    {
      title: t('schedule'),
      dataIndex: 'schedule',
      key: 'schedule',
      render: (value: string) => <Schedule id="schedule" schedule={value} />,
    },
    {
      title: t('data-set'),
      dataIndex: 'dataSetId',
      key: 'data-set',
      render: (value: number) => <DataSet dataSetId={value} />,
      sorter: (a, b) => {
        const dataSetA = dataSets?.find(
          ({ id: testId }) => a.dataSetId === testId
        );
        const identifierA = dataSetA?.name ?? dataSetA?.externalId ?? '';
        const dataSetB = dataSets?.find(
          ({ id: testId }) => b.dataSetId === testId
        );
        const identifierB = dataSetB?.name ?? dataSetB?.externalId ?? '';
        return identifierA.localeCompare(identifierB);
      },
    },
    {
      title: t('owner'),
      dataIndex: 'owner',
      key: 'owner',
      render: (value: User) => {
        if (!value) {
          return '-';
        }
        const displayName = value.name ?? value.email;
        return <span>{displayName}</span>;
      },
      sorter: (recordA, recordB) =>
        stringSorter(
          recordA.owner?.name ?? recordA.owner?.email ?? '',
          recordB.owner?.name ?? recordB.owner?.email ?? ''
        ),
    },
    {
      title: t('last-modified'),
      dataIndex: 'lastUpdatedTime',
      key: 'last-modified',
      render: (value: number) => (
        <RelativeTimeWithTooltip id="last-modified" time={value} />
      ),
      sorter: (recordA, recordB) =>
        dateSorter(recordA.lastUpdatedTime, recordB.lastUpdatedTime),
    },
  ];

  if (hasNextPage || !isFetched) {
    return <Loader />;
  }

  return (
    <Table
      columns={columns}
      appendTooltipTo={getContainer()}
      dataSource={filteredExtractionPipelines}
      defaultSort={defaultSort}
      emptyContent={
        <TableNoResults
          title={t('extraction-pipeline-list-no-records')}
          content={t('extraction-pipeline-list-search-not-found', {
            $: search !== '' ? `"${search}"` : search,
          })}
        />
      }
    />
  );
};

export default ExtpipesTable;
