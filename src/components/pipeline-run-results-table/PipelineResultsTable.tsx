import { ColumnType, Table } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';
import {
  EMPipelineRun,
  EMPipelineRunMatch,
} from 'hooks/entity-matching-pipelines';
import { useMemo } from 'react';
import ResourceName from './ResourceName';

type PipelineResultsTableRecord = EMPipelineRunMatch;

type PipelineResultsTableColumnType = ColumnType<PipelineResultsTableRecord> & {
  title: string;
};

type PipelineResultsTableProps = {
  run: EMPipelineRun;
};

const PipelineResultsTable = ({
  run,
}: PipelineResultsTableProps): JSX.Element => {
  const { t } = useTranslation();

  const columns: PipelineResultsTableColumnType[] = useMemo(
    () => [
      {
        title: t('qm-result-source'),
        dataIndex: 'source',
        key: 'source',
        render: (source: EMPipelineRunMatch['source']) => (
          <ResourceName resource={source} />
        ),
      },
      {
        title: t('qm-result-target'),
        dataIndex: 'target',
        key: 'target',
        render: (target: EMPipelineRunMatch['target']) => (
          <ResourceName resource={target} />
        ),
      },
    ],
    [t]
  );

  const dataSource = useMemo(() => run.matches, [run.matches]);

  return (
    <Table<PipelineResultsTableRecord>
      columns={columns}
      dataSource={dataSource}
      emptyContent={undefined}
      appendTooltipTo={undefined}
    />
  );
};

export default PipelineResultsTable;
