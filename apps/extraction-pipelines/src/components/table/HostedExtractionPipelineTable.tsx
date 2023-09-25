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
import {
  MQTTSourceWithJobMetrics,
  useMQTTSourcesWithJobMetrics,
} from '../../hooks/hostedExtractors';
import {
  dateSorter,
  getContainer,
  numberSorter,
  stringSorter,
} from '../../utils/utils';
import { ErrorComponent } from '../error';
import HostedExtractionPipelineExternalId from '../extpipes/cols/HostedExtractionPipelineExternalId';
import RelativeTimeWithTooltip from '../extpipes/cols/RelativeTimeWithTooltip';
import { SourceOptions } from '../source-options-dropdown/SourceOptions';

export type HostedExtractionPipelineListTableRecord = {
  key: string;
} & MQTTSourceWithJobMetrics;

type HostedExtractionPipelineTableProps = {
  headerComp: React.JSX.Element;
  emptyPage: React.JSX.Element;
  search?: string;
};

const HostedExtractionPipelineTable = ({
  headerComp,
  emptyPage,
  search,
}: HostedExtractionPipelineTableProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    data: sourcesData,
    isInitialLoading: loading,
    error,
    refetch,
  } = useMQTTSourcesWithJobMetrics();

  const sources = useMemo(
    () => sourcesData?.map((s) => ({ ...s, key: s.externalId })),
    [sourcesData]
  );

  const filteredSources = useMemo(() => {
    return sources?.filter(({ externalId }) =>
      externalId.toLowerCase().includes(search?.toLowerCase() ?? '')
    );
  }, [sources, search]);

  const defaultSort: [string, SortOrder] = ['last-created-time', 'descend'];

  const columns: (ColumnType<HostedExtractionPipelineListTableRecord> & {
    title: string;
  })[] = [
    {
      title: t('external-id'),
      dataIndex: 'externalId',
      key: 'externalId',
      render: (value: string) => (
        <HostedExtractionPipelineExternalId externalId={value} />
      ),
      sorter: (recordA, recordB) =>
        stringSorter(recordA.externalId, recordB.externalId),
    },
    {
      title: t('throughput'),
      dataIndex: 'throughput',
      key: 'throughput',
      render: (value) =>
        t('datapoints-per-hour', {
          count: value,
        }),
      sorter: (recordA, recordB) =>
        numberSorter(recordA.throughput, recordB.throughput),
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
    {
      title: '',
      dataIndex: 'sourceOptions',
      key: 'source-options',
      render: (_, record) => <SourceOptions source={record} />,
    },
  ];

  const isEmptyData = useMemo(() => {
    return sourcesData?.length === 0;
  }, [sourcesData]);

  if (loading) {
    return <Loader />;
  }

  if (isEmptyData) {
    return <>{emptyPage}</>;
  }

  if (error) {
    return (
      <ErrorComponent
        tabKey="hosted"
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
        dataSource={filteredSources}
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

export default HostedExtractionPipelineTable;
