import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import { Checkbox, Flex } from '@cognite/cogs.js';
import { CogniteInternalId } from '@cognite/sdk';
import { Select } from 'antd';

import {
  EMPipelineRun,
  EMPipelineRunMatch,
  Pipeline,
} from 'hooks/entity-matching-pipelines';
import { useTranslation } from 'common';

import BasicResultsTable from './BasicResultsTable';
import GroupedResultsTable from './GroupedResultsTable';
import { getMatchedAssetIds } from 'utils';
import MatchTypeOptionContent from './MatchTypeOptionContent';

type PipelineRunResultsTableProps = {
  pipeline: Pipeline;
  run: EMPipelineRun;
  selectedSourceIds: CogniteInternalId[];
  setSelectedSourceIds: Dispatch<SetStateAction<CogniteInternalId[]>>;
};

type MatchType =
  | 'all'
  | 'unmatched'
  | 'matched'
  | 'previously-confirmed'
  | 'different-recommendation';

type MatchOptionType = {
  label: React.ReactNode;
  value: MatchType;
};

const PipelineRunResultsTable = ({
  pipeline,
  run,
  selectedSourceIds,
  setSelectedSourceIds,
}: PipelineRunResultsTableProps): JSX.Element => {
  const { t } = useTranslation();

  const [shouldGroupByPattern, setShouldGroupByPattern] = useState(false);

  const [selectedMatchType, setSelectedMatchType] = useState<MatchType>('all');

  const [
    allMatches,
    unmatchedMatches,
    matchedMatches,
    previouslyConfirmedMatches,
    differentRecommendationMatches,
  ]: [
    EMPipelineRunMatch[],
    EMPipelineRunMatch[],
    EMPipelineRunMatch[],
    EMPipelineRunMatch[],
    EMPipelineRunMatch[]
  ] = useMemo(() => {
    const allMatches = run.matches ?? [];
    const unmatchedMatches =
      run.matches?.filter(({ source }) => {
        const matchedAssetIds = getMatchedAssetIds(source);
        return matchedAssetIds.length === 0;
      }) ?? [];
    const matchedMatches =
      run.matches?.filter(({ source, target }) => {
        const matchedAssetIds = getMatchedAssetIds(source);
        return matchedAssetIds.length > 0 && !target?.id;
      }) ?? [];
    const previouslyConfirmedMatches =
      run.matches?.filter(
        ({ matchType }) => matchType === 'previously_mapped'
      ) ?? [];
    const differentRecommendationMatches =
      run.matches?.filter(({ source, target }) => {
        const matchedAssetIds = getMatchedAssetIds(source);
        return (
          matchedAssetIds.length > 0 &&
          typeof target?.id === 'number' &&
          !matchedAssetIds.includes(target.id)
        );
      }) ?? [];
    return [
      allMatches,
      unmatchedMatches,
      matchedMatches,
      previouslyConfirmedMatches,
      differentRecommendationMatches,
    ];
  }, [run]);

  const filteredMatches: EMPipelineRunMatch[] | undefined = useMemo(() => {
    switch (selectedMatchType) {
      case 'all':
        return allMatches;
      case 'unmatched':
        return unmatchedMatches;
      case 'matched':
        return matchedMatches;
      case 'previously-confirmed':
        return previouslyConfirmedMatches;
      case 'different-recommendation':
        return differentRecommendationMatches;
    }
  }, [
    allMatches,
    unmatchedMatches,
    matchedMatches,
    previouslyConfirmedMatches,
    differentRecommendationMatches,
    selectedMatchType,
  ]);

  const matchTypeOptions: MatchOptionType[] = [
    {
      label: (
        <MatchTypeOptionContent count={allMatches.length} label={t('all')} />
      ),
      value: 'all',
    },
    {
      label: (
        <MatchTypeOptionContent
          count={unmatchedMatches.length}
          label={t('unmatched')}
        />
      ),
      value: 'unmatched',
    },
    {
      label: (
        <MatchTypeOptionContent
          count={matchedMatches.length}
          label={t('matched')}
        />
      ),
      value: 'matched',
    },
    {
      label: (
        <MatchTypeOptionContent
          count={previouslyConfirmedMatches.length}
          label={t('previously-confirmed')}
        />
      ),
      value: 'previously-confirmed',
    },
    {
      label: (
        <MatchTypeOptionContent
          count={differentRecommendationMatches.length}
          label={t('different-recommendation')}
        />
      ),
      value: 'different-recommendation',
    },
  ];

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
      <Flex gap={16}>
        <Select
          disabled={shouldGroupByPattern}
          options={matchTypeOptions}
          onChange={handleSelectMatchType}
          style={{ width: 300 }}
          value={selectedMatchType}
        />
        <Checkbox
          disabled={!run.generatedRules || run.generatedRules.length === 0}
          label={t('group-by-pattern')}
          checked={shouldGroupByPattern}
          onChange={(e) => setShouldGroupByPattern(e.target.checked)}
        />
      </Flex>
      {shouldGroupByPattern ? (
        <GroupedResultsTable
          pipeline={pipeline}
          run={run}
          selectedSourceIds={selectedSourceIds}
          setSelectedSourceIds={setSelectedSourceIds}
        />
      ) : (
        <BasicResultsTable
          pipeline={pipeline}
          matches={filteredMatches}
          selectedSourceIds={selectedSourceIds}
          setSelectedSourceIds={setSelectedSourceIds}
        />
      )}
    </Flex>
  );
};

export default PipelineRunResultsTable;
