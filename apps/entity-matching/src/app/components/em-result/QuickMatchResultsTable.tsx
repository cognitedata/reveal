import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import styled from 'styled-components';

import { TableRowSelection } from 'antd/lib/table/interface';

import MatchInfo from '@entity-matching-app/components/MatchInfo';

import { useTranslation } from '@entity-matching-app/common';

import ExpandedMatch from '@entity-matching-app/components/pipeline-run-results-table/ExpandedMatch';

import { PAGINATION_SETTINGS } from '@entity-matching-app/common/constants';

import { ExpandButton } from '@entity-matching-app/components/pipeline-run-results-table/GroupedResultsTable';
import ResourceCell from '@entity-matching-app/components/pipeline-run-results-table/ResourceCell';

import { ColumnType, Table } from '@cognite/cdf-utilities';

import { EMModel } from '@entity-matching-app/hooks/entity-matching-models';

import { Icon, RangeSlider } from '@cognite/cogs.js';

import {
  Match,
  Prediction,
  PredictionObject,
} from '@entity-matching-app/hooks/entity-matching-predictions';
import { SourceType } from '@entity-matching-app/types/api';
import { formatPredictionObject } from '@entity-matching-app/utils';

import ConfidenceScore from './Confidence';

type Props = {
  sourceType: SourceType;
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
  sourceType,
  model,
  predictions,
  confirmedPredictions,
  setConfirmedPredictions,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const handleClickExpandButton = (clickedRowKey: number) => {
    setExpandedRowKeys((prevState) =>
      prevState.includes(clickedRowKey)
        ? prevState.filter((key) => key !== clickedRowKey)
        : prevState.concat(clickedRowKey)
    );
  };

  const [scoreFilter, setScoreFilter] = useState<number[]>([]);
  const dataSource = useMemo(
    () =>
      predictions
        .filter((p) =>
          scoreFilter.length === 2
            ? 100 * p.match.score >= scoreFilter[0] &&
              100 * p.match.score <= scoreFilter[1]
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

  const columns = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const columns: ResultsTableRecordCT[] = [
      {
        title: t('qm-result-source', {
          resource: t(`resource-type-${sourceType}`, {
            count: 1,
          }).toLocaleLowerCase(),
        }),
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
              <RangeSlider
                min={minScore}
                max={maxScore}
                defaultValue={[minScore, maxScore]}
                value={scoreFilter}
                marks={{
                  ...scores.reduce(
                    (accl: any, i) => ({ ...accl, [i]: <></> }),
                    {}
                  ),

                  [minScore]: `${Math.floor(minScore)}%`,
                  [maxScore]: `${Math.ceil(maxScore)}%`,
                }}
                setValue={(n) => setScoreFilter(n)}
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
    ];
    if (sourceType !== 'threeD') {
      columns.splice(-1, 0, {
        title: t('existing-target'),
        key: 'existing',
        render: (p: Prediction) => {
          return <MatchInfo api={sourceType} id={p.source.id} />;
        },
      });
    }
    return columns;
  }, [
    expandedRowKeys,
    maxScore,
    minScore,
    model?.matchFields,
    scoreFilter,
    scores,
    sourceType,
    t,
  ]);

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
