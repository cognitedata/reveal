import { Key, useMemo, useState } from 'react';

import { ColumnType, Table } from '@cognite/cdf-utilities';
import styled from 'styled-components';

import { useTranslation } from 'common';
import {
  EMPipelineGeneratedRule,
  EMPipelineGeneratedRuleMatch,
} from 'hooks/entity-matching-pipelines';

import ResourceName from './ResourceName';
import { Colors } from '@cognite/cogs.js';
import { PAGINATION_SETTINGS } from 'common/constants';

type ExpandedRuleTableRecord = EMPipelineGeneratedRuleMatch & { key: number };

type ExpandedRuleTableColumnType = ColumnType<ExpandedRuleTableRecord> & {
  title: string;
};

type ExpandedRuleProps = {
  rule: EMPipelineGeneratedRule;
};

const ExpandedRule = ({ rule }: ExpandedRuleProps): JSX.Element => {
  const { t } = useTranslation();

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

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

  const handleSelectRow = (selectedRowKeys: Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  return (
    <Container>
      <Table<ExpandedRuleTableRecord>
        columns={columns}
        dataSource={dataSource}
        emptyContent={undefined}
        appendTooltipTo={undefined}
        pagination={PAGINATION_SETTINGS}
        rowSelection={{
          selectedRowKeys,
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
