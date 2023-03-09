import { useMemo } from 'react';
import { ColumnType, Table } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';
import { Prediction, PredictionObject } from 'hooks/contextualization-api';
import { PredictionsTableTypes } from 'types/types';
import { formatPredictionObject } from 'utils';
import { Body } from '@cognite/cogs.js';

type Predictions = {
  predictions: Prediction[];
};

type PredictionsTableRecord = { key: string } & Pick<
  Prediction,
  PredictionsTableTypes
>;

type ResultsTableRecordCT = ColumnType<PredictionsTableRecord> & {
  title: string;
  key: PredictionsTableTypes;
};

const QuickMatchResultsTable = ({ predictions }: Predictions): JSX.Element => {
  const { t } = useTranslation();

  const dataSource = useMemo(
    () =>
      predictions
        ?.filter((prediction) => prediction.matches.length > 0)
        .map((a) => ({ ...a, key: a.source.id.toString() })) || [],
    [predictions]
  );

  const columns: ResultsTableRecordCT[] = useMemo(
    () => [
      {
        title: t('qm-result-score'),
        dataIndex: 'matches',
        key: 'matches',
        render: (matches: any[]) =>
          (
            <Body level={2} strong>
              {matches[0]?.score.toFixed(1)}
            </Body>
          ) || '—',
      },
      {
        title: t('qm-result-source'),
        dataIndex: 'source',
        key: 'source',
        render: (source: PredictionObject) =>
          formatPredictionObject(source) || '—',
      },
      {
        title: t('qm-result-target'),
        dataIndex: 'matches',
        key: 'matches',
        render: (matches: any[]) =>
          formatPredictionObject(matches[0]?.target) || '—',
      },
    ],
    [t]
  );

  return (
    <Table<PredictionsTableRecord>
      columns={columns}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      dataSource={dataSource}
    />
  );
};

export default QuickMatchResultsTable;
