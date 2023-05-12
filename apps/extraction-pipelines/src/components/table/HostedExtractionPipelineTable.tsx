import React, { useMemo } from 'react';

import { Loader } from '@cognite/cogs.js';
import {
  ColumnType,
  SortOrder,
  Table,
  TableNoResults,
} from '@cognite/cdf-utilities';

import { useTranslation } from 'common';
import RelativeTimeWithTooltip from 'components/extpipes/cols/RelativeTimeWithTooltip';
import HostedExtractionPipelineExternalId from 'components/extpipes/cols/HostedExtractionPipelineExternalId';
import {
  MQTTSourceWithJobMetrics,
  useMQTTSourcesWithJobMetrics,
} from 'hooks/hostedExtractors';
import {
  dateSorter,
  getContainer,
  numberSorter,
  stringSorter,
} from 'utils/utils';
import { SourceOptions } from 'components/source-options-dropdown/SourceOptions';

export type HostedExtractionPipelineListTableRecord = {
  key: string;
} & MQTTSourceWithJobMetrics;

type HostedExtractionPipelineTableProps = {
  search?: string;
};

const HostedExtractionPipelineTable = ({
  search,
}: HostedExtractionPipelineTableProps): JSX.Element => {
  const { t } = useTranslation();

  const { data: sourcesData, isFetched: didFetchMQTTSources } =
    useMQTTSourcesWithJobMetrics();

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

  if (!didFetchMQTTSources) {
    return <Loader />;
  }

  return (
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
  );
};

export default HostedExtractionPipelineTable;
