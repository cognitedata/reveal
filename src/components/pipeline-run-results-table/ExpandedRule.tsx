import { Dispatch, SetStateAction, useMemo } from 'react';
import { ColumnType, Table } from '@cognite/cdf-utilities';
import styled from 'styled-components';

import { useTranslation } from 'common';

import ResourceName from './ResourceName';
import { Colors } from '@cognite/cogs.js';
import { RuleMatch } from 'hooks/entity-matching-rules';
import { TableRowSelection } from 'antd/lib/table/interface';
import { PAGINATION_SETTINGS } from 'common/constants';

type ExpandedRuleTableRecord = RuleMatch & { key: number };

type ExpandedRuleTableColumnType = ColumnType<ExpandedRuleTableRecord> & {
  title: string;
};

type ExpandedRuleProps = {
  matches: RuleMatch[];
  confirmedPredictions: number[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
};

const ExpandedRule = ({
  matches,
  confirmedPredictions,
  setConfirmedPredictions,
}: ExpandedRuleProps): JSX.Element => {
  const { t } = useTranslation();

  const columns: ExpandedRuleTableColumnType[] = useMemo(
    () => [
      {
        title: t('qm-result-source'),
        dataIndex: 'source',
        key: 'source',
        render: (source: RuleMatch['source']) => (
          <ResourceName resource={source} />
        ),
      },
      {
        title: t('qm-result-target'),
        dataIndex: 'target',
        key: 'target',
        render: (target: RuleMatch['target']) => (
          <ResourceName resource={target} />
        ),
      },
    ],
    [t]
  );

  const dataSource = useMemo(
    () =>
      matches?.map((match) => ({
        ...match,
        key:
          match.source?.id && typeof match.source.id === 'number'
            ? match.source.id
            : -1,
      })),
    [matches]
  );

  const rowSelection: TableRowSelection<ExpandedRuleTableRecord> = {
    selectedRowKeys: confirmedPredictions,
    onSelectAll(all) {
      if (all) {
        setConfirmedPredictions(matches.map((p) => p.source.id));
      } else {
        setConfirmedPredictions([]);
      }
    },
    onChange(keys, _, info) {
      if (info.type === 'single') {
        setConfirmedPredictions(keys as number[]);
      }
    },
    columnWidth: 36,
  };

  return (
    <Container>
      <Table<ExpandedRuleTableRecord>
        columns={columns}
        dataSource={dataSource}
        emptyContent={undefined}
        appendTooltipTo={undefined}
        rowSelection={rowSelection}
        pagination={PAGINATION_SETTINGS}
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
