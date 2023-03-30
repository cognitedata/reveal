import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import { Body, Button, Checkbox, Flex } from '@cognite/cogs.js';
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
import MatchTypeOptionContent from './MatchTypeOptionContent';
import { MatchOptionType, MatchType } from 'types/types';

type PipelineRunResultsTableProps = {
  pipeline: Pipeline;
  run: EMPipelineRun;
  selectedSourceIds: CogniteInternalId[];
  setSelectedSourceIds: Dispatch<SetStateAction<CogniteInternalId[]>>;
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

  const [allMatches, previouslyConfirmedMatches]: [
    EMPipelineRunMatch[],
    EMPipelineRunMatch[]
  ] = useMemo(() => {
    const allMatches = run.matches ?? [];
    const previouslyConfirmedMatches =
      run.matches?.filter(
        ({ matchType }) => matchType === 'previously-confirmed'
      ) ?? [];
    return [allMatches, previouslyConfirmedMatches];
  }, [run]);

  const filteredMatches: EMPipelineRunMatch[] | undefined = useMemo(() => {
    switch (selectedMatchType) {
      case 'all':
        return allMatches;
      case 'previously-confirmed':
        return previouslyConfirmedMatches;
    }
  }, [allMatches, previouslyConfirmedMatches, selectedMatchType]);

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
          count={previouslyConfirmedMatches.length}
          label={t('previously-confirmed')}
        />
      ),
      value: 'previously-confirmed',
    },
  ];

  const handleSelectMatchType = (value: MatchType) => {
    setSelectedMatchType(value);
  };

  const handleSelectAllMatches = (): void => {
    setSelectedSourceIds(
      (run.matches
        ?.filter(({ source }) => typeof source?.id === 'number')
        .map(({ source }) => source?.id) as number[] | undefined) ?? []
    );
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
        <Flex alignItems="center" gap={16}>
          {selectedSourceIds.length > 0 && (
            <Body level={2} muted>
              {t('matches-with-count', { count: selectedSourceIds.length })}
            </Body>
          )}
          <Button
            disabled={selectedSourceIds.length === run.matches?.length}
            onClick={handleSelectAllMatches}
          >
            {t('select-all-matches')}
          </Button>
        </Flex>
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
