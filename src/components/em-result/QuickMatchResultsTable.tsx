import { Dispatch, SetStateAction, useMemo } from 'react';
import { ColumnType, Table } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';
import { Prediction, PredictionObject } from 'hooks/contextualization-api';
import { formatPredictionObject } from 'utils';
import ConfidenceScore from './Confidence';
import { Checkbox, Flex } from '@cognite/cogs.js';

type Predictions = {
  predictions: Prediction[];
  sourceIds: number[];
  setSourceIds: Dispatch<SetStateAction<number[]>>;
};

type PredictionsTableRecord = {
  key: string;
  score?: number;
} & Prediction;

type ResultsTableRecordCT = ColumnType<PredictionsTableRecord> & {
  title: string;
  score?: number;
};

const QuickMatchResultsTable = ({
  predictions,
  sourceIds,
  setSourceIds,
}: Predictions): JSX.Element => {
  const { t } = useTranslation();

  const dataSource = useMemo(
    () =>
      predictions
        ?.filter((prediction) => prediction.matches.length > 0)
        .map((a) => ({
          ...a,
          key: a.source.id.toString(),
          score: a.matches[0]?.score,
        })) || [],
    [predictions]
  );

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
        dataIndex: 'matches',
        key: 'matches',
        render: (matches: any[]) =>
          formatPredictionObject(matches[0]?.target) || '—',
        sorter: (a: Prediction, b: Prediction) =>
          formatPredictionObject(a.matches[0]?.target).localeCompare(
            formatPredictionObject(b.matches[0]?.target)
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
          (a.matches[0]?.score ?? 0) - (b.matches[0]?.score ?? 0),
        sortDirections: ['descend', 'ascend'],
        defaultSortOrder: 'descend',
        width: 100,
      },
      {
        title: t('confirm'),
        dataIndex: 'source',
        key: 'source',
        width: 100,
        render: (source: PredictionObject) => {
          return (
            <Flex justifyContent="center">
              <Checkbox
                name={`checkbox-${source.id}`}
                checked={sourceIds.includes(source.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSourceIds((prevState) => [...prevState, source.id]);
                  } else {
                    setSourceIds((prevState) =>
                      prevState.filter((sourceId) => sourceId !== source.id)
                    );
                  }
                }}
              />
            </Flex>
          );
        },
      },
    ],
    [t, setSourceIds, sourceIds]
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
