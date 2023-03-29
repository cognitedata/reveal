import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Flex, Icon } from '@cognite/cogs.js';
import { TableRowSelection } from 'antd/lib/table/interface';
import { useTranslation } from 'common';
import { PAGINATION_SETTINGS } from 'common/constants';
import ExpandedRule from 'components/pipeline-run-results-table/ExpandedRule';
import { ExpandButton } from 'components/pipeline-run-results-table/GroupedResultsTable';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

type Props = {
  appliedRules?: AppliedRule[];
  predictions: Prediction[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
};

type AppliedRuleTableRecord = { key: number } & AppliedRule;
type AppliedRuleTableRecordCT = ColumnType<AppliedRuleTableRecord> & {
  title: string;
  key: 'pattern' | 'fields' | 'numberOfMatches' | 'matches' | 'expandable';
};

export default function AppliedRulesTable({
  appliedRules,
  setConfirmedPredictions,
}: Props) {
  const { t } = useTranslation();

  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const handleClickExpandButton = (clickedRowKey: number) => {
    setExpandedRowKeys((prevState) =>
      prevState.includes(clickedRowKey)
        ? prevState.filter((key) => key !== clickedRowKey)
        : prevState.concat(clickedRowKey)
    );
  };

  const columns: AppliedRuleTableRecordCT[] = useMemo(
    () => [
      {
        title: t('rules-pattern'),
        key: 'pattern',
        sorter: (a: AppliedRule, b: AppliedRule) =>
          (a.rule.extractors[0]?.pattern || '').localeCompare(
            b.rule.extractors[1]?.pattern || ''
          ),
        render: (rule: AppliedRule) => {
          return (
            <Flex alignItems="center" gap={12}>
              <>{rule.rule.extractors[0]?.pattern}</>
              <Icon type="ArrowRight" />
              <>{rule.rule.extractors[1]?.pattern}</>
            </Flex>
          );
        },
      },
      {
        title: t('rules-fields'),
        key: 'fields',
        sorter: (a: AppliedRule, b: AppliedRule) =>
          `${a.rule.extractors[0]?.field} ${a.rule.extractors[1]?.field}`.localeCompare(
            `${b.rule.extractors[0]?.field} ${b.rule.extractors[1]?.field}`
          ),
        render: (rule: AppliedRule) => {
          return (
            <Flex alignItems="center" gap={12}>
              <>{rule.rule.extractors[0]?.field}</>
              <Icon type="ArrowRight" />
              <>{rule.rule.extractors[1]?.field}</>
            </Flex>
          );
        },
      },
      {
        title: t('rules-matches'),
        key: 'numberOfMatches',
        width: 100,
        sorter: (a: AppliedRule, b: AppliedRule) =>
          a.numberOfMatches - b.numberOfMatches,
        render: (rule: AppliedRule) => rule.numberOfMatches.toLocaleString(),
      },
      {
        title: '',
        dataIndex: 'matches',
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
    [t, expandedRowKeys]
  );

  const appliedRulesList = useMemo(
    () =>
      appliedRules?.map((r, i) => ({
        ...r,
        key: i,
      })) || [],
    [appliedRules]
  );

  const rowSelection: TableRowSelection<AppliedRuleTableRecord> = {
    hideSelectAll: true,
    onChange(selectedKeys) {
      const confirmed = (selectedKeys as number[]).reduce(
        (accl: number[], i) => [
          ...accl,
          ...(appliedRules?.[i]?.matches.map((m) => m.source.id) || []),
        ],
        []
      );
      setConfirmedPredictions(confirmed);
    },
  };

  if (!appliedRules || appliedRules.length === 0) {
    return <>NOPE</>;
  }

  return (
    <Table<AppliedRuleTableRecord>
      columns={columns}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      dataSource={appliedRulesList}
      pagination={PAGINATION_SETTINGS}
      rowSelection={rowSelection}
      expandable={{
        showExpandColumn: false,
        expandedRowKeys: expandedRowKeys,
        expandedRowRender: (record) =>
          !!record.matches ? <ExpandedRule matches={record.matches} /> : false,
        indentSize: 64,
      }}
    />
  );
}
