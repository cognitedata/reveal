import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import styled from 'styled-components';

import { Select } from 'antd';

import { Flex, Switch } from '@cognite/cogs.js';
import { CogniteEvent, FileInfo, Sequence, Timeseries } from '@cognite/sdk';

import { useTranslation } from '../../common';
import { EMModel } from '../../hooks/entity-matching-models';
import { Prediction } from '../../hooks/entity-matching-predictions';
import { useRetrieve } from '../../hooks/retrieve';
import { SourceType } from '../../types/api';
import { MatchOptionType, MatchType } from '../../types/types';
import { generateAppliedRules } from '../../utils/rules';
import MatchTypeOptionContent from '../pipeline-run-results-table/MatchTypeOptionContent';
import QuickMatchActionBar from '../qm-action-bar/QuickMatchActionbar';
import Step from '../step';

import AppliedRulesTable from './applied-rules-table';
import QuickMatchResultsTable from './QuickMatchResultsTable';

type Props = {
  sourceType: SourceType;
  model?: EMModel;
  predictions: Prediction[];
  confirmedPredictions: number[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
};
export default function EntityMatchingResult({
  sourceType,
  model,
  predictions,
  confirmedPredictions,
  setConfirmedPredictions,
}: Props) {
  const { t } = useTranslation();

  const [rulesView, setRulesView] = useState(false);

  const onClose = () => setConfirmedPredictions([]);

  const [selectedMatchType, setSelectedMatchType] = useState<MatchType>('all');

  const { data, isInitialLoading, isError } = useRetrieve(
    sourceType,
    predictions.map((p) => ({ id: p.source.id }))
  );

  let matchTypeOptions: MatchOptionType[] = [
    {
      label: (
        <MatchTypeOptionContent count={predictions.length} label={t('all')} />
      ),
      value: 'all',
    },
  ];

  const matched: any[] = useMemo(
    () =>
      // eslint-disable-next-line
      // @ts-ignore
      data?.filter((d: any) => {
        switch (sourceType) {
          case 'timeseries':
          case 'sequences': {
            return !!(d as Timeseries | Sequence).assetId;
          }
          case 'files':
          case 'events': {
            return ((d as FileInfo | CogniteEvent).assetIds?.length || 0) > 0;
          }
          default: {
            return false;
          }
        }
      }) || [],
    [data, sourceType]
  );

  const unmatched: any[] = useMemo(
    () =>
      // eslint-disable-next-line
      // @ts-ignore
      data?.filter((d: any) => {
        switch (sourceType) {
          case 'timeseries':
          case 'sequences': {
            return !(d as Timeseries | Sequence).assetId;
          }
          case 'files':
          case 'events': {
            return ((d as FileInfo | CogniteEvent).assetIds?.length || 0) === 0;
          }
          default: {
            return false;
          }
        }
      }) || [],
    [data, sourceType]
  );

  const appliedRules = useMemo(
    () => (rulesView ? generateAppliedRules(predictions) : []),
    [predictions, rulesView]
  );

  const diffMatched: any[] = useMemo(
    () =>
      // eslint-disable-next-line
      // @ts-ignore
      data?.filter((d: any) => {
        switch (sourceType) {
          case 'timeseries':
          case 'sequences': {
            const r = d as Timeseries | Sequence;
            return (
              !!r.assetId &&
              r.assetId !==
                predictions.find((p) => p.source.id === d.id)?.match.target.id
            );
          }
          case 'files':
          case 'events': {
            // eslint-disable-next-line
            const p = predictions.find((p) => p.source.id === d.id)?.match
              .target.id;
            const r = d as FileInfo | CogniteEvent;
            return (
              p && (r.assetIds?.length || 0) > 0 && !r.assetIds?.includes(p)
            );
          }
          default: {
            return false;
          }
        }
      }) || [],
    [data, predictions, sourceType]
  );

  if (!isError && !isInitialLoading && data) {
    matchTypeOptions = [
      ...matchTypeOptions,
      {
        label: (
          <MatchTypeOptionContent count={matched.length} label={t('matched')} />
        ),
        value: 'matched',
      },
      {
        label: (
          <MatchTypeOptionContent
            count={unmatched.length}
            label={t('unmatched')}
          />
        ),
        value: 'unmatched',
      },
      {
        label: (
          <MatchTypeOptionContent
            count={diffMatched.length}
            label={t('diff-matched')}
          />
        ),
        value: 'diff-matched',
      },
    ];
  }

  const filteredPreditions = useMemo(() => {
    switch (selectedMatchType) {
      case 'all': {
        return predictions;
      }
      case 'unmatched': {
        return predictions.filter((p) =>
          unmatched.find((r) => r.id === p.source.id)
        );
      }
      case 'matched': {
        return predictions.filter((p) =>
          matched.find((r) => r.id === p.source.id)
        );
      }
      case 'diff-matched': {
        return predictions.filter((p) =>
          diffMatched.find((r) => r.id === p.source.id)
        );
      }
      default: {
        return predictions;
      }
    }
  }, [predictions, diffMatched, matched, selectedMatchType, unmatched]);

  return (
    <Step
      title={t('result-step-title', { step: 4 })}
      subtitle={t('result-step-subtitle')}
    >
      <Container $isActionBarVisible={!!confirmedPredictions.length}>
        <Flex direction="column" gap={16}>
          <Flex gap={12} alignItems="center">
            <Select
              disabled={rulesView}
              loading={isInitialLoading}
              options={matchTypeOptions}
              onChange={(value) => setSelectedMatchType(value)}
              style={{ width: 300 }}
              value={selectedMatchType}
            />
            <Switch
              label={t('group-by-pattern')}
              checked={rulesView}
              onChange={() => setRulesView((enabled) => !enabled)}
            />
          </Flex>
          {rulesView ? (
            <AppliedRulesTable
              appliedRules={appliedRules}
              predictions={predictions}
              confirmedPredictions={confirmedPredictions}
              setConfirmedPredictions={setConfirmedPredictions}
            />
          ) : (
            <QuickMatchResultsTable
              sourceType={sourceType}
              model={model}
              predictions={filteredPreditions}
              confirmedPredictions={confirmedPredictions}
              setConfirmedPredictions={setConfirmedPredictions}
            />
          )}
        </Flex>
        <QuickMatchActionBar
          selectedRows={confirmedPredictions}
          sourceType={sourceType}
          onClose={onClose}
        />
      </Container>
    </Step>
  );
}

const Container = styled.div<{ $isActionBarVisible?: boolean }>`
  overflow-y: auto;
  padding-bottom: ${({ $isActionBarVisible }) =>
    $isActionBarVisible ? 56 : 0}px;
`;
