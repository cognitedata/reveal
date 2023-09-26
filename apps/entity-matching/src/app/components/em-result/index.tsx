import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import styled from 'styled-components';

import MatchTypeOptionContent from '@entity-matching-app/components/pipeline-run-results-table/MatchTypeOptionContent';

import { Select } from 'antd';

import QuickMatchActionBar from '@entity-matching-app/components/qm-action-bar/QuickMatchActionbar';

import { useTranslation } from '@entity-matching-app/common';

import Step from '@entity-matching-app/components/step';
import { EMModel } from '@entity-matching-app/hooks/entity-matching-models';

import { Flex, Switch } from '@cognite/cogs.js';

import { Prediction } from '@entity-matching-app/hooks/entity-matching-predictions';

import { CogniteEvent, FileInfo, Sequence, Timeseries } from '@cognite/sdk';

import { useRetrieve } from '@entity-matching-app/hooks/retrieve';
import { SourceType } from '@entity-matching-app/types/api';
import { AppliedRule } from '@entity-matching-app/types/rules';
import { MatchOptionType, MatchType } from '@entity-matching-app/types/types';

import AppliedRulesTable from './applied-rules-table';
import QuickMatchResultsTable from './QuickMatchResultsTable';

type Props = {
  sourceType: SourceType;
  model?: EMModel;
  predictions: Prediction[];
  confirmedPredictions: number[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
  appliedRules?: AppliedRule[];
};
export default function EntityMatchingResult({
  sourceType,
  model,
  predictions,
  confirmedPredictions,
  setConfirmedPredictions,
  appliedRules,
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
          {appliedRules && (
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
          )}
          {rulesView && appliedRules ? (
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
