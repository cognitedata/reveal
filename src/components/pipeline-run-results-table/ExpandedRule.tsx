import { Dispatch, Key, SetStateAction, useMemo } from 'react';

import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';
import { CogniteInternalId } from '@cognite/sdk';
import styled from 'styled-components';

import { useTranslation } from 'common';
import {
  EMPipelineGeneratedRule,
  EMPipelineGeneratedRuleMatch,
} from 'hooks/entity-matching-pipelines';

import ResourceName from './ResourceName';

type ExpandedRuleTableRecord = EMPipelineGeneratedRuleMatch & { key: number };

type ExpandedRuleTableColumnType = ColumnType<ExpandedRuleTableRecord> & {
  title: string;
};

type ExpandedRuleProps = {
  rule: EMPipelineGeneratedRule;
  selectedSourceIds: CogniteInternalId[];
  setSelectedSourceIds: Dispatch<SetStateAction<CogniteInternalId[]>>;
};

const ExpandedRule = ({
  rule,
  selectedSourceIds,
  setSelectedSourceIds,
}: ExpandedRuleProps): JSX.Element => {
  const { t } = useTranslation();

  const columns: ExpandedRuleTableColumnType[] = useMemo(
    () => [
      {
        title: t('qm-result-source'),
        dataIndex: 'source',
        key: 'source',
        render: (source: EMPipelineGeneratedRuleMatch['source']) => (
          <ResourceName resource={source} />
        ),
      },
      {
        title: t('qm-result-target'),
        dataIndex: 'target',
        key: 'target',
        render: (target: EMPipelineGeneratedRuleMatch['target']) => (
          <ResourceName resource={target} />
        ),
      },
    ],
    [t]
  );

  const dataSource = useMemo(
    () =>
      rule.matches?.map((match) => ({
        ...match,
        key:
          match.source?.id && typeof match.source.id === 'number'
            ? match.source.id
            : -1,
      })),
    [rule.matches]
  );

  const handleSelectRow = (rowKeys: Key[]) => {
    setSelectedSourceIds(
      rowKeys.map((rowKey: Key) =>
        typeof rowKey === 'string' ? parseInt(rowKey) : rowKey
      )
    );
  };

  return (
    <Container>
      <Table<ExpandedRuleTableRecord>
        columns={columns}
        dataSource={dataSource}
        emptyContent={undefined}
        appendTooltipTo={undefined}
        rowSelection={{
          selectedRowKeys: selectedSourceIds,
          onChange: handleSelectRow,
          columnWidth: 36,
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  background-color: ${Colors['surface--medium']};
  padding-left: 36px;

  .ant-table,
  .ant-table-cell {
    background: inherit;
  }
`;

export default ExpandedRule;
