import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Flex, Icon } from '@cognite/cogs.js';
import { TableRowSelection } from 'antd/lib/table/interface';
import { useTranslation } from 'common';
import { PAGINATION_SETTINGS } from 'common/constants';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import MatchInfoButton from './MatchInfoButton';

type Props = {
  appliedRules?: AppliedRule[];
  predictions: Prediction[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
};

type AppliedRuleTableRecord = { key: number } & AppliedRule;
type AppliedRuleTableRecordCT = ColumnType<AppliedRuleTableRecord> & {
  title: string;
  key: 'pattern' | 'fields' | 'numberOfMatches' | 'matches';
};

export default function AppliedRulesTable({
  appliedRules,
  setConfirmedPredictions,
}: Props) {
  useEffect(() => {}, []);

  const { t } = useTranslation();
  const columns: AppliedRuleTableRecordCT[] = useMemo(
    () => [
      {
        title: t('rules-pattern'),
        key: 'pattern',
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

        render: (rule: AppliedRule) => (
          <Flex alignItems="center" gap={12}>
            <>{rule.numberOfMatches.toLocaleString()}</>
            <MatchInfoButton rule={rule} />
          </Flex>
        ),
      },
    ],
    [t]
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
    />
  );
}
