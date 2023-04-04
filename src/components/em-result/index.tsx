import { Checkbox, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import AppliedRulesTable from './applied-rules-table';
import QuickMatchResultsTable from './QuickMatchResultsTable';
import QuickMatchActionBar from 'components/qm-action-bar/QuickMatchActionbar';
import Step from 'components/step';
import styled from 'styled-components';
import { SourceType } from 'types/api';
import { EMModel } from 'hooks/entity-matching-models';
import { Select } from 'antd';
import MatchTypeOptionContent from 'components/pipeline-run-results-table/MatchTypeOptionContent';
import { MatchOptionType, MatchType } from 'types/types';
import { useRetrieve } from 'hooks/retrieve';
import { CogniteEvent, FileInfo, Sequence, Timeseries } from '@cognite/sdk';

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
      // @ts-ignore
      data?.filter((d: any) => {
        switch (sourceType) {
          case 'timeseries':
          case 'sequences': {
            return !!(d as Timeseries | Sequence).assetId;
          }
          case 'files':
          case 'events': {
            return !((d as FileInfo | CogniteEvent).assetIds?.length === 0);
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
      // @ts-ignore
      data?.filter((d: any) => {
        switch (sourceType) {
          case 'timeseries':
          case 'sequences': {
            return !(d as Timeseries | Sequence).assetId;
          }
          case 'files':
          case 'events': {
            return (d as FileInfo | CogniteEvent).assetIds?.length === 0;
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
            const p = predictions.find((p) => p.source.id === d.id)?.match
              .target.id;
            const r = d as FileInfo | CogniteEvent;
            return (
              p && (r.assetIds?.length || 0) > 0 && r.assetIds?.includes(p)
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
            <Flex gap={12}>
              <Select
                disabled={rulesView}
                loading={isInitialLoading}
                options={matchTypeOptions}
                onChange={(value) => setSelectedMatchType(value)}
                style={{ width: 300 }}
                value={selectedMatchType}
              />
              <Checkbox
                label={t('group-by-pattern')}
                checked={rulesView}
                onChange={(e) => setRulesView(e.target.checked)}
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
