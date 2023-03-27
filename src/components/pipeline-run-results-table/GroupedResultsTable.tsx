import { useMemo, useState } from 'react';

import { ColumnType, Table } from '@cognite/cdf-utilities';
import styled from 'styled-components';

import { useTranslation } from 'common';
import {
  EMPipelineGeneratedRule,
  EMPipelineRun,
  Pipeline,
} from 'hooks/entity-matching-pipelines';

import Extractor from './Extractor';
import { Icon } from '@cognite/cogs.js';
import ExpandedRule from './ExpandedRule';

type GroupedResultsTableRecord = EMPipelineGeneratedRule & { key: string };

type GroupedResultsTableColumnType = ColumnType<GroupedResultsTableRecord> & {
  title: string;
};

type GroupedResultsTableProps = {
  pipeline: Pipeline;
  run: EMPipelineRun;
};

const GroupedResultsTable = ({
  run,
}: GroupedResultsTableProps): JSX.Element => {
  const { t } = useTranslation();

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const handleClickExpandButton = (clickedRowKey: string) => {
    setExpandedRowKeys((prevState) =>
      prevState.includes(clickedRowKey)
        ? prevState.filter((key) => key !== clickedRowKey)
        : prevState.concat(clickedRowKey)
    );
  };

  const columns: GroupedResultsTableColumnType[] = useMemo(
    () => [
      {
        title: t('source'),
        dataIndex: 'extractors',
        key: 'source',
        render: (extractors) => (
          <Extractor extractors={extractors} entitySetToRender="sources" />
        ),
      },
      {
        title: t('target'),
        dataIndex: 'extractors',
        key: 'target',
        render: (extractors) => (
          <Extractor extractors={extractors} entitySetToRender="targets" />
        ),
      },
      {
        title: '',
        dataIndex: 'extractors',
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
      run.generatedRules?.map((rule) => ({
        ...rule,
        key: rule.extractors?.map(({ pattern }) => pattern).join('-') ?? '',
      })) ?? [],
    [run.generatedRules]
  );

  return (
    <Table<GroupedResultsTableRecord>
      columns={columns}
      dataSource={dataSource}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      expandable={{
        showExpandColumn: false,
        expandedRowKeys: expandedRowKeys,
        expandedRowRender: (record) => <ExpandedRule rule={record} />,
        indentSize: 64,
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

export default GroupedResultsTable;
