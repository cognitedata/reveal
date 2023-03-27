import { useMemo } from 'react';

import { ColumnType, Table } from '@cognite/cdf-utilities';

import { useTranslation } from 'common';
import {
  EMPipelineGeneratedRule,
  EMPipelineRun,
  Pipeline,
} from 'hooks/entity-matching-pipelines';

import Pattern from './Pattern';

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

  const columns: GroupedResultsTableColumnType[] = useMemo(
    () => [
      {
        title: t('source'),
        dataIndex: 'extractors',
        key: 'source',
        render: (extractors) => (
          <Pattern extractors={extractors} entitySetToRender="sources" />
        ),
      },
      {
        title: t('target'),
        dataIndex: 'extractors',
        key: 'target',
        render: (extractors) => (
          <Pattern extractors={extractors} entitySetToRender="targets" />
        ),
      },
    ],
    [t]
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
    />
  );
};

export default GroupedResultsTable;
