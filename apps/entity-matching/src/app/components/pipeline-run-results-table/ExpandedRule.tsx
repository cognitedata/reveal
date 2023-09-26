import { Dispatch, SetStateAction, useMemo } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@entity-matching-app/common';
import { PAGINATION_SETTINGS } from '@entity-matching-app/common/constants';
import { RuleMatch } from '@entity-matching-app/types/rules';
import { ColoredExtractor } from '@entity-matching-app/utils/colored-rules';
import { TableRowSelection } from 'antd/lib/table/interface';

import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';
import { CogniteInternalId } from '@cognite/sdk';

import ExtractorMatchesCell from './ExtractorMatchesCell';

type ExpandedRuleTableRecord = RuleMatch & { key: number };

type ExpandedRuleTableColumnType = ColumnType<ExpandedRuleTableRecord> & {
  title: string;
};

type ExpandedRuleProps = {
  extractors: ColoredExtractor[];
  matches: RuleMatch[];
  selectedSourceIds: CogniteInternalId[];
  setSelectedSourceIds: Dispatch<SetStateAction<CogniteInternalId[]>>;
};

const ExpandedRule = ({
  extractors,
  matches,
  selectedSourceIds,
  setSelectedSourceIds,
}: ExpandedRuleProps): JSX.Element => {
  const { t } = useTranslation();

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
            resource={target}
          />
        ),
      },
    ],
    [extractors, t]
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
