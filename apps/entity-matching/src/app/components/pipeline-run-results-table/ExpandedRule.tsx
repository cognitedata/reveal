import { Dispatch, SetStateAction, useMemo } from 'react';

import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';
import { CogniteInternalId } from '@cognite/sdk';
import { TableRowSelection } from 'antd/lib/table/interface';
import styled from 'styled-components';

import { useTranslation } from 'common';
import { PAGINATION_SETTINGS } from 'common/constants';
import { RuleMatch } from 'hooks/entity-matching-rules';
import {
  EMMatchCondition,
  EMPipelineRegexExtractor,
} from 'hooks/entity-matching-pipelines';

import ExtractorMatchesCell from './ExtractorMatchesCell';

type ExpandedRuleTableRecord = RuleMatch & { key: number };

type ExpandedRuleTableColumnType = ColumnType<ExpandedRuleTableRecord> & {
  title: string;
};

type ExpandedRuleProps = {
  conditions: EMMatchCondition[];
  extractors: EMPipelineRegexExtractor[];
  matches: RuleMatch[];
  selectedSourceIds: CogniteInternalId[];
  setSelectedSourceIds: Dispatch<SetStateAction<CogniteInternalId[]>>;
};

export type MatchColorsByGroupIndex = {
  [groupIndex: number]: string;
};

export type MatchColorsByExtractorIndex = {
  [extractorIndex: number]: MatchColorsByGroupIndex;
};

const COLORS = [
  '#4363d8',
  '#3cb44b',
  '#911eb4',
  '#f58231',
  '#e6194b',
  '#844700',
  '#206969',
  '#f032e6',
  '#405502',
  '#6e5353',
  '#008080',
  '#e6beff',
  '#9a6324',
  '#424135',
  '#800000',
  '#42614b',
  '#808000',
  '#6b5137',
  '#000075',
  '#555555',
  '#000000',
];

const getMatchColorsByExtractorIndex = (
  conditions: EMMatchCondition[]
): MatchColorsByExtractorIndex => {
  const matchColors: MatchColorsByExtractorIndex = {};

  conditions.forEach(
    ({ arguments: conditionArguments, conditionType }, conditionIndex) => {
      if (conditionType === 'equals') {
        conditionArguments.forEach(([extractorIndex, groupIndex]) => {
          if (!matchColors[extractorIndex]) {
            matchColors[extractorIndex] = {};
          }
          matchColors[extractorIndex][groupIndex] =
            COLORS[conditionIndex % COLORS.length];
        });
      }
    }
  );

  return matchColors;
};

const ExpandedRule = ({
  conditions,
  extractors,
  matches,
  selectedSourceIds,
  setSelectedSourceIds,
}: ExpandedRuleProps): JSX.Element => {
  const { t } = useTranslation();

  const matchColorsByExtractorIndex =
    getMatchColorsByExtractorIndex(conditions);

  const columns: ExpandedRuleTableColumnType[] = useMemo(
    () => [
      {
        title: t('qm-result-source', {
          resource: t('resource').toLocaleLowerCase(),
        }),
        dataIndex: 'source',
        key: 'source',
        render: (source: RuleMatch['source']) => (
          <ExtractorMatchesCell
            entitySetToRender="sources"
            extractors={extractors}
            matchColorsByExtractorIndex={matchColorsByExtractorIndex}
            resource={source}
          />
        ),
      },
      {
        title: t('qm-result-target'),
        dataIndex: 'target',
        key: 'target',
        render: (target: RuleMatch['target']) => (
          <ExtractorMatchesCell
            entitySetToRender="targets"
            extractors={extractors}
            matchColorsByExtractorIndex={matchColorsByExtractorIndex}
            resource={target}
          />
        ),
      },
    ],
    [extractors, matchColorsByExtractorIndex, t]
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
    selectedRowKeys: selectedSourceIds,
    onSelectAll: (all) => {
      if (all) {
        setSelectedSourceIds(matches.map((p) => p.source.id));
      } else {
        setSelectedSourceIds([]);
      }
    },
    onChange: (keys, _, info) => {
      if (info.type === 'single') {
        setSelectedSourceIds(keys as number[]);
      }
    },
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
