import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Body, Flex, Icon, Title } from '@cognite/cogs.js';
import { TableRowSelection } from 'antd/lib/table/interface';
import { useTranslation } from 'common';
import { PAGINATION_SETTINGS } from 'common/constants';
import { Container, Graphic } from 'components/InfoBox';
import ExpandedRule from 'components/pipeline-run-results-table/ExpandedRule';
import Extractor from 'components/pipeline-run-results-table/Extractor';
import { ExpandButton } from 'components/pipeline-run-results-table/GroupedResultsTable';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

type Props = {
  predictions: Prediction[];
  appliedRules: AppliedRule[];
  confirmedPredictions: number[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
};

type AppliedRuleTableRecord = { key: number } & AppliedRule;
type AppliedRuleTableRecordCT = ColumnType<AppliedRuleTableRecord> & {
  title: string;
  key:
    | 'source'
    | 'target'
    | 'fields'
    | 'numberOfMatches'
    | 'matches'
    | 'expandable';
};

export default function AppliedRulesTable({
  appliedRules,
  confirmedPredictions,
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
        title: t('source'),
        key: 'source',
        render: (rule: AppliedRule) => (
          <Extractor
            extractors={rule.rule.extractors}
            entitySetToRender="sources"
          />
        ),
      },
      {
        title: t('target'),
        key: 'target',
        render: (rule: AppliedRule) => (
          <Extractor
            extractors={rule.rule.extractors}
            entitySetToRender="targets"
          />
        ),
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
                  ? 'ChevronUp'
                  : 'ChevronDown'
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

  if (appliedRules.length === 0) {
    return (
      <Container direction="row" justifyContent="space-between">
        <Flex direction="column" alignItems="flex-start">
          <Title level={4}>{t('result-rules-empty-title')}</Title>
          <Body level={1}>{t('result-rules-empty-body')}</Body>
        </Flex>
        <Graphic />
      </Container>
    );
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
          !!record.matches && !!record.rule.extractors ? (
            <ExpandedRule
              extractors={record.rule.extractors}
              matches={record.matches}
              selectedSourceIds={confirmedPredictions}
              setSelectedSourceIds={setConfirmedPredictions}
            />
          ) : (
            false
          ),
        indentSize: 64,
      }}
    />
  );
}
