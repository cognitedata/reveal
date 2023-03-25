import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Flex, Icon } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { useMemo } from 'react';
import { SourceType } from 'types/api';
import ApplyButton from './ApplyButton';
import MatchInfoButton from './MatchInfoButton';

type Props = {
  predictJobId: number;
  sourceType: SourceType;
  appliedRules?: AppliedRule[];
};

type AppliedRuleTableRecord = { key: string } & AppliedRule;
type AppliedRuleTableRecordCT = ColumnType<AppliedRuleTableRecord> & {
  title: string;
  key: 'pattern' | 'fields' | 'numberOfMatches' | 'matches' | 'apply';
};

export default function AppliedRulesTable({
  appliedRules,
  sourceType,
  predictJobId,
}: Props) {
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
      {
        title: '',
        key: 'apply',
        width: 150,
        align: 'center',
        render: (rule: AppliedRule) => (
          <ApplyButton
            rule={rule}
            predictJobId={predictJobId}
            sourceType={sourceType}
          />
        ),
      },
    ],
    [predictJobId, sourceType, t]
  );
  const appliedRulesList = useMemo(
    () =>
      appliedRules?.map((r, i) => ({
        ...r,
        key: `${i}`,
      })) || [],
    [appliedRules]
  );

  if (!appliedRules || appliedRules.length === 0) {
    return <>NOPE</>;
  }

  return (
    <Table<AppliedRuleTableRecord>
      columns={columns}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      dataSource={appliedRulesList}
      pagination={{
        defaultPageSize: 25,
        hideOnSinglePage: true,
      }}
    />
  );
}
