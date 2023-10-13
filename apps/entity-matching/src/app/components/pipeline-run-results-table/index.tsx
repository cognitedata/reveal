import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import { Select } from 'antd';

import { Body, Flex, Switch } from '@cognite/cogs.js';
import {
  CogniteEvent,
  CogniteInternalId,
  FileInfo,
  Sequence,
  Timeseries,
} from '@cognite/sdk';

import { useTranslation } from '../../common';
import {
  EMPipelineRun,
  EMPipelineRunMatch,
  Pipeline,
} from '../../hooks/entity-matching-pipelines';
import { useRetrieve } from '../../hooks/retrieve';
import { pipelineSourceToAPIType } from '../../pages/pipeline/details/sources';
import { MatchOptionType, MatchType } from '../../types/types';

import BasicResultsTable from './BasicResultsTable';
import GroupedResultsTable from './GroupedResultsTable';
import MatchTypeOptionContent from './MatchTypeOptionContent';

type PipelineRunResultsTableProps = {
  pipeline: Pipeline;
  run: EMPipelineRun;
  selectedSourceIds: CogniteInternalId[];
  setSelectedSourceIds: Dispatch<SetStateAction<CogniteInternalId[]>>;
};

type RealMatchSet = { [sourceId: number]: number[] };

const PipelineRunResultsTable = ({
  pipeline,
  run,
  selectedSourceIds,
  setSelectedSourceIds,
}: PipelineRunResultsTableProps): JSX.Element => {
  const { t } = useTranslation();

  const [shouldGroupByPattern, setShouldGroupByPattern] = useState(false);

  const [selectedMatchType, setSelectedMatchType] = useState<MatchType>('all');

  const { data, isInitialLoading, isError } = useRetrieve(
    pipelineSourceToAPIType[pipeline.sources.resource],
    run.matches
      ?.filter(({ source }) => typeof source?.id === 'number')
      .map(({ source }) => ({ id: source?.id as number })) ?? []
  );

  let matchTypeOptions: MatchOptionType[] = [
    {
      label: (
        <MatchTypeOptionContent
          count={run.matches?.length ?? 0}
          label={t('all')}
        />
      ),
      value: 'all',
    },
  ];

  const realMatchSet: RealMatchSet = useMemo(() => {
    if (!data) {
      return {};
    }

    const set: RealMatchSet = {};

    switch (pipelineSourceToAPIType[pipeline.sources.resource]) {
      case 'timeseries':
        (data as Timeseries[]).forEach((d) => {
          if (d.assetId) {
            set[d.id] = [d.assetId];
          }
        });
        break;
      case 'sequences':
        (data as Sequence[]).forEach((d) => {
          if (d.assetId) {
            set[d.id] = [d.assetId];
          }
        });
        break;
      case 'files':
        (data as FileInfo[]).forEach((d) => {
          if (d.assetIds?.length) {
            set[d.id] = d.assetIds;
          }
        });
        break;
      case 'events': {
        (data as CogniteEvent[]).forEach((d) => {
          if (d.assetIds?.length) {
            set[d.id] = d.assetIds;
          }
        });
        break;
      }
      default: {
        break;
      }
    }

    return set;
  }, [data, pipeline.sources.resource]);

  const [matched, unmatched, previouslyConfirmed, differentRecommendation]: [
    EMPipelineRunMatch[],
    EMPipelineRunMatch[],
    EMPipelineRunMatch[],
    EMPipelineRunMatch[]
  ] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const matched =
      run?.matches?.filter(({ source }) => {
        return (
          typeof source?.id === 'number' && !!realMatchSet[source.id]?.length
        );
      }) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const unmatched =
      run?.matches?.filter(({ source }) => {
        return (
          typeof source?.id !== 'number' || !realMatchSet[source.id]?.length
        );
      }) ?? [];
    const previouslyConfirmedMatches =
      run.matches?.filter(
        ({ matchType }) => matchType === 'previously-confirmed'
      ) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const differentRecommendation = matched?.filter(({ source, target }) => {
      return (
        typeof source?.id === 'number' &&
        typeof target?.id === 'number' &&
        !realMatchSet[source.id]?.includes(target.id)
      );
    });
    return [
      matched,
      unmatched,
      previouslyConfirmedMatches,
      differentRecommendation,
    ];
  }, [run, realMatchSet]);

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
            count={differentRecommendation.length}
            label={t('diff-matched')}
          />
        ),
        value: 'diff-matched',
      },
      {
        label: (
          <MatchTypeOptionContent
            count={previouslyConfirmed.length}
            label={t('previously-confirmed')}
          />
        ),
        value: 'previously-confirmed',
      },
    ];
  }

  const filteredMatches: EMPipelineRunMatch[] | undefined = useMemo(() => {
    switch (selectedMatchType) {
      case 'all':
        return run.matches;
      case 'matched':
        return matched;
      case 'unmatched':
        return unmatched;
      case 'diff-matched':
        return differentRecommendation;
      case 'previously-confirmed':
        return previouslyConfirmed;
    }
  }, [
    run.matches,
    matched,
    unmatched,
    differentRecommendation,
    previouslyConfirmed,
    selectedMatchType,
  ]);

  const handleSelectMatchType = (value: MatchType) => {
    setSelectedMatchType(value);
  };

  useEffect(() => {
    if (shouldGroupByPattern) {
      setSelectedMatchType('all');
    }
  }, [shouldGroupByPattern]);

  return (
    <Flex direction="column" gap={16}>
      <Flex gap={16} justifyContent="space-between">
        <Flex gap={16}>
          <Select
            disabled={shouldGroupByPattern}
            loading={isInitialLoading}
            options={matchTypeOptions}
            onChange={handleSelectMatchType}
            style={{ width: 300 }}
            value={selectedMatchType}
          />
          <div data-testid="group-by-pattern">
            <Switch
              disabled={!run.generatedRules || run.generatedRules.length === 0}
              label={t('group-by-pattern')}
              checked={shouldGroupByPattern}
              onChange={(e) => setShouldGroupByPattern(e.target.checked)}
            />
          </div>
        </Flex>
        <Flex alignItems="center" gap={16}>
          {selectedSourceIds.length > 0 && (
            <Body level={2} muted>
              {t('matches-with-count', { count: selectedSourceIds.length })}
            </Body>
          )}
        </Flex>
      </Flex>
      {shouldGroupByPattern ? (
        <GroupedResultsTable
          pipeline={pipeline}
          run={run}
          selectedSourceIds={selectedSourceIds}
          setSelectedSourceIds={setSelectedSourceIds}
          dataTestId="pipeline-rules-table"
        />
      ) : (
        <BasicResultsTable
          pipeline={pipeline}
          matches={filteredMatches}
          selectedSourceIds={selectedSourceIds}
          setSelectedSourceIds={setSelectedSourceIds}
          dataTestId="pipeline-results-table"
        />
      )}
    </Flex>
  );
};

export default PipelineRunResultsTable;
