import { Dispatch, SetStateAction, useMemo } from 'react';
import { ColumnType, Table } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';

import { formatPredictionObject } from 'utils';
import ConfidenceScore from './Confidence';
import {
  Match,
  Prediction,
  PredictionObject,
} from 'hooks/entity-matching-predictions';
import { PAGINATION_SETTINGS } from 'common/constants';
import { TableRowSelection } from 'antd/lib/table/interface';

type Predictions = {
  predictions: Prediction[];
  confirmedPredictions: number[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
};

type PredictionsTableRecord = {
  key: number;
  score?: number;
} & Prediction;

type ResultsTableRecordCT = ColumnType<PredictionsTableRecord> & {
  title: string;
  score?: number;
};

const QuickMatchResultsTable = ({
  predictions,
  confirmedPredictions,
  setConfirmedPredictions,
}: Predictions): JSX.Element => {
  const { t } = useTranslation();

  const dataSource = useMemo(
    () =>
      predictions.map((a) => ({
        ...a,
        key: a.source.id,
        score: a.match.score,
      })) || [],
    [predictions]
  );

  const rowSelection: TableRowSelection<PredictionsTableRecord> = {
    selectedRowKeys: confirmedPredictions,
    onSelectAll(all) {
      if (all) {
        setConfirmedPredictions(predictions.map((p) => p.source.id));
      } else {
        setConfirmedPredictions([]);
      }
    },
    onChange(_, selectedRows, info) {
      if (info.type === 'single') {
        setConfirmedPredictions(selectedRows.map((s) => s.key));
      }
    },
  };

  const columns: ResultsTableRecordCT[] = useMemo(
    () => [
      {
        title: t('qm-result-source'),
        dataIndex: 'source',
        key: 'source',
        render: (source: PredictionObject) =>
          formatPredictionObject(source) || '—',
        sorter: (a: Prediction, b: Prediction) =>
          formatPredictionObject(a.source).localeCompare(
            formatPredictionObject(b.source)
          ),
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: t('qm-result-target'),
        dataIndex: 'match',
        key: 'match',
        render: (match: Match) => {
          return formatPredictionObject(match.target) || '—';
        },
        sorter: (a: Prediction, b: Prediction) =>
          formatPredictionObject(a.match.target).localeCompare(
            formatPredictionObject(b.match.target)
          ),
      },

      {
        title: t('confidence'),
        dataIndex: 'score',
        key: 'score',
        align: 'center',
        render: (score: number | undefined) => (
          <ConfidenceScore score={score} />
        ),
        sorter: (a: Prediction, b: Prediction) =>
          (a.match.score ?? 0) - (b.match.score ?? 0),
        sortDirections: ['descend', 'ascend'],
        defaultSortOrder: 'descend',
        width: 100,
      },
    ],
    [t]
  );

  return (
    <Table<PredictionsTableRecord>
      rowSelection={{
        type: 'checkbox',
        ...rowSelection,
      }}
      columns={columns}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      dataSource={dataSource}
      pagination={PAGINATION_SETTINGS}
    />
  );
};

export default QuickMatchResultsTable;
