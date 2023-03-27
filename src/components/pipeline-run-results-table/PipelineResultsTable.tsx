import { Key, useMemo, useState } from 'react';

import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import {
  EMPipelineRun,
  EMPipelineRunMatch,
  Pipeline,
} from 'hooks/entity-matching-pipelines';

import ResourceName from './ResourceName';
import ExpandedMatch from './ExpandedMatch';
import Confidence from 'components/em-result/Confidence';

type PipelineResultsTableRecord = EMPipelineRunMatch & { key: string };

type PipelineResultsTableColumnType = ColumnType<PipelineResultsTableRecord> & {
  title: string;
};

type PipelineResultsTableProps = {
  pipeline: Pipeline;
  run: EMPipelineRun;
};

const PipelineResultsTable = ({
  pipeline,
  run,
}: PipelineResultsTableProps): JSX.Element => {
  const { t } = useTranslation();

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const handleClickExpandButton = (clickedRowKey: string) => {
    setExpandedRowKeys((prevState) =>
      prevState.includes(clickedRowKey)
        ? prevState.filter((key) => key !== clickedRowKey)
        : prevState.concat(clickedRowKey)
    );
  };

  const handleSelectRow = (selectedRowKeys: Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const columns: PipelineResultsTableColumnType[] = useMemo(
    () => [
      {
        title: t('qm-result-source'),
        dataIndex: 'source',
        key: 'source',
        render: (source: EMPipelineRunMatch['source']) => (
          <ResourceName resource={source} />
        ),
      },
      {
        title: t('qm-result-target'),
        dataIndex: 'target',
        key: 'target',
        render: (target: EMPipelineRunMatch['target']) => (
          <ResourceName resource={target} />
        ),
      },
      {
        title: t('confidence'),
        dataIndex: 'score',
        key: 'score',
        render: (score: EMPipelineRunMatch['score']) => (
          <Confidence score={score} />
        ),
        sorter: (rowA: EMPipelineRunMatch, rowB: EMPipelineRunMatch) =>
          (rowA.score ?? 0) - (rowB.score ?? 0),
        width: 64,
      },
      {
        title: '',
        dataIndex: 'source',
        key: 'expandable',
        render: (_, record) => (
          <ExpandButton onClick={() => handleClickExpandButton(record.key)}>
            <Icon
              type={
                expandedRowKeys.includes(record.key)
                  ? 'ChevronDown'
                  : 'ChevronRight'
              }
            />
          </ExpandButton>
        ),
        width: 64,
      },
    ],
    [expandedRowKeys, t]
  );

  const dataSource = useMemo(
    () =>
      run.matches?.map((match) => ({
        ...match,
        key: `${JSON.stringify(match.source)} - ${JSON.stringify(
          match.target
        )}`,
      })) ?? [],
    [run.matches]
  );

  return (
    <Table<PipelineResultsTableRecord>
      columns={columns}
      dataSource={dataSource}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      expandable={{
        showExpandColumn: false,
        expandedRowKeys: expandedRowKeys,
        expandedRowRender: (record) => (
          <ExpandedMatch match={record} pipeline={pipeline} />
        ),
        indentSize: 64,
      }}
      rowSelection={{
        selectedRowKeys,
        onChange: handleSelectRow,
        columnWidth: 36,
      }}
    />
  );
};

const ExpandButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  box-shadow: none;
  cursor: pointer;
  display: flex;
  height: 36px;
  justify-content: center;
  padding: 0;
  width: 36px;
`;

export default PipelineResultsTable;
