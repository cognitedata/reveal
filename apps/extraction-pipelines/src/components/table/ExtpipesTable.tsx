import React, { useMemo } from 'react';

import styled from 'styled-components';

import {
  ColumnType,
  SortOrder,
  Table,
  TableNoResults,
} from '@cognite/cdf-utilities';
import { Flex, Loader } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { useDataSetList } from '../../hooks/dataSet';
import { useAllExtpipes } from '../../hooks/useExtpipes';
import { Extpipe } from '../../model/Extpipe';
import { User } from '../../model/User';
import { addIfExist, calculateLatest } from '../../utils/extpipeUtils';
import { dateSorter, getContainer, stringSorter } from '../../utils/utils';
import { ErrorComponent } from '../error';
import { DataSet } from '../extpipes/cols/DataSet';
import ExtractionPipelineName from '../extpipes/cols/ExtractionPipelineName';
import RelativeTimeWithTooltip from '../extpipes/cols/RelativeTimeWithTooltip';
import Schedule from '../extpipes/cols/Schedule';
import { LastRunStatusMarker } from '../extpipes/cols/StatusMarker';

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
  headerComp: React.JSX.Element;
  emptyPage: React.JSX.Element;
  search?: string;
};

const ExtpipesTable = ({
  headerComp,
  search,
  emptyPage,
}: ExtpipesTableProps): JSX.Element => {
  const { t } = useTranslation();

  const { data, hasNextPage, isFetched, error, refetch } = useAllExtpipes();

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
        return value ? (
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

  const isEmptyData = useMemo(() => {
    return data?.pages?.[0]?.items.length === 0;
  }, [data]);

  if (hasNextPage || !isFetched) {
    return <Loader />;
  }

  if (isEmptyData) {
    return <>{emptyPage}</>;
  }

  if (error) {
    return (
      <ErrorComponent
        tabKey="self-hosted"
        error={error}
        handleErrorDialogClick={async () => {
          await refetch();
        }}
      />
    );
  }

  return (
    <Container gap={16}>
      <>{headerComp}</>
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
    </Container>
  );
};

const Container = styled(Flex)`
  margin-top: 16px;
  flex-direction: column;
  width: 100%;
`;

export default ExtpipesTable;
