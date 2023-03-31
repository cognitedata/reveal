import { Dispatch, SetStateAction, useMemo, useState } from 'react';
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
import { Icon, Slider } from '@cognite/cogs.js';
import ResourceCell from 'components/pipeline-run-results-table/ResourceCell';
import styled from 'styled-components';
import { EMModel } from 'hooks/entity-matching-models';
import ExpandedMatch from 'components/pipeline-run-results-table/ExpandedMatch';
import { ExpandButton } from 'components/pipeline-run-results-table/GroupedResultsTable';

type Predictions = {
  model?: EMModel;
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
  model,
  predictions,
  confirmedPredictions,
  setConfirmedPredictions,
}: Predictions): JSX.Element => {
  const { t } = useTranslation();

  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const handleClickExpandButton = (clickedRowKey: number) => {
    setExpandedRowKeys((prevState) =>
      prevState.includes(clickedRowKey)
        ? prevState.filter((key) => key !== clickedRowKey)
        : prevState.concat(clickedRowKey)
    );
  };

  const [scoreFilter, setScoreFilter] = useState<number | undefined>();
  const dataSource = useMemo(
    () =>
      predictions
        .filter((p) =>
          Number.isFinite(scoreFilter)
            ? 100 * p.match.score >= (scoreFilter as number)
            : true
        )
        .map((a) => ({
          ...a,
          key: a.source.id,
          score: a.match.score,
        })) || [],
    [predictions, scoreFilter]
  );

  const scores = useMemo(() => {
    return Array.from(new Set(predictions.map((p) => p.match.score * 100)));
  }, [predictions]);
  const [minScore, maxScore] = [Math.min(...scores), Math.max(...scores)];

  const rowSelection: TableRowSelection<PredictionsTableRecord> = {
    selectedRowKeys: confirmedPredictions,
    onSelectAll(all) {
      if (all) {
        setConfirmedPredictions(dataSource.map((ds) => ds.key));
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
        render: (source: PredictionObject) => (
          <ResourceCell resource={source} showId />
        ),
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
        render: (match: Match) => (
          <ResourceCell resource={match.target} showId />
        ),
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
        filterDropdown: () =>
          Number.isFinite(minScore) &&
          Number.isFinite(maxScore) && (
            <SliderWrapper>
              <Slider
                min={minScore}
                max={maxScore}
                defaultValue={minScore}
                value={scoreFilter}
                step={null}
                marks={{
                  ...scores.reduce(
                    (accl: any, i) => ({ ...accl, [i]: <></> }),
                    {}
                  ),

                  [minScore]: `${Math.floor(minScore)}%`,
                  [maxScore]: `${Math.ceil(maxScore)}%`,
                }}
                onChange={(n) => setScoreFilter(n)}
                handle={({ value }) => <>{value.toFixed(1)}%</>}
              />
            </SliderWrapper>
          ),
        width: 100,
      },
      {
        title: '',
        dataIndex: 'source',
        key: 'expandable',
        render: (_, record) =>
          model?.matchFields ? (
            <ExpandButton onClick={() => handleClickExpandButton(record.key)}>
              <Icon
                type={
                  expandedRowKeys.includes(record.key)
                    ? 'ChevronUp'
                    : 'ChevronDown'
                }
              />
            </ExpandButton>
          ) : (
            <></>
          ),
        width: 64,
      },
    ],
    [
      t,
      minScore,
      maxScore,
      scores,
      scoreFilter,
      expandedRowKeys,
      model?.matchFields,
    ]
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
      expandable={{
        showExpandColumn: false,
        expandedRowKeys: expandedRowKeys,
        expandedRowRender: model?.matchFields
          ? (record) => (
              <ExpandedMatch
                source={record.source}
                target={record.match.target}
                matchFields={model?.matchFields}
              />
            )
          : undefined,
        indentSize: 64,
      }}
    />
  );
};

const SliderWrapper = styled.div`
  background-color: white;
  padding: 22px;
  width: 400px;
  border-radius: 12px;
`;

export default QuickMatchResultsTable;
