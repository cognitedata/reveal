import { useMemo } from 'react';
import { ColumnType, Table } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';
import { Prediction, PredictionObject } from 'hooks/contextualization-api';
import { PredictionsTableTypes } from 'types/types';
import { formatPredictionObject } from 'utils';
import ConfidenceScore from './Confidence';
import { Checkbox, Flex } from '@cognite/cogs.js';

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
        width: '30%',
        render: (matches: any[]) => matches[0]?.score.toFixed(1) || '—',
      },
      {
        title: t('qm-result-source'),
        dataIndex: 'source',
        key: 'source',
        width: '30%',
        render: (source: PredictionObject) =>
          formatPredictionObject(source) || '—',
      },
      {
        title: t('qm-result-target'),
        dataIndex: 'matches',
        key: 'matches',
        width: '30%',
        render: (matches: any[]) =>
          formatPredictionObject(matches[0]?.target) || '—',
      },

      {
        title: 'Confidence',
        dataIndex: 'matches',
        key: 'matches',
        align: 'center',
        width: '30%',
        render: (matches: any[]) => (
          <ConfidenceScore score={matches[0]?.score} />
        ),
        sorter: (a: Prediction, b: Prediction) =>
          (a.matches[0]?.score ?? 0) - (b.matches[0]?.score ?? 0),
        sortDirections: ['descend', 'ascend'],
        defaultSortOrder: 'descend',
      },
      {
        title: 'Confirm',
        dataIndex: 'source',
        key: 'source',
        width: 10,
        render: (source: PredictionObject) => {
          return (
            <Flex justifyContent="center">
              <Checkbox name={`checkbox-${source.id}`} />
            </Flex>
          );
        },
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
