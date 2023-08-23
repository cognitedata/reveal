import { useContext, useEffect, useState } from 'react';

import { useCreateSuggestImprovementsJob } from '@fusion/contextualization';

import { Button, Popconfirm, Tooltip } from '@cognite/cogs.js';

import { FormattedContainer } from '../components/FormattedContainer';
import { LabelingBody } from '../components/LabelingBody';
import { POLLING_INTERVAL } from '../constants';
import { useCreateAdvancedJoinMatchesWrapper } from '../hooks/useCreateAdvancedJoinMatchesWrapper';
import { useGetMatchInputInstances } from '../hooks/useGetMatchInputInstances';
import { useImprovementSuggestions } from '../hooks/useImprovementSuggestions';
import { ManualMatchesContext } from '../pages/AdvancedJoinsPage';
import { JobStatus, ManualMatch, ImprovementSuggestion } from '../types';
import { getAllManualMatchesDefined } from '../utils/manualMatchUtils';

export const Labeling = ({
  advancedJoinExternalId,
  labelingStage,
  onClickStartLabeling,
  refetchManualMatchesList,
}: {
  advancedJoinExternalId: string | undefined;
  labelingStage: boolean;
  onClickStartLabeling: () => void;
  refetchManualMatchesList: () => void;
}) => {
  const [jobState, setJobState] = useState<JobStatus | undefined>();

  const { manualMatches, setManualMatches } = useContext(ManualMatchesContext);
  const allDefined = getAllManualMatchesDefined(manualMatches);

  const { data: { jobId } = {}, refetch: createNewJob } =
    useCreateSuggestImprovementsJob(
      advancedJoinExternalId, // pass correct value
      !!advancedJoinExternalId && advancedJoinExternalId !== '' && labelingStage
    );

  const {
    SuggestImprovementsJobResults: {
      data: { status, improvementSuggestions: suggestions } = {},
      refetch: refetchJobStatus,
    },
    originInstances,
  } = useImprovementSuggestions(jobId);

  const createJoins = useCreateAdvancedJoinMatchesWrapper();

  const matchInputInstances = useGetMatchInputInstances();

  const handleWriteMatchers = async () => {
    createJoins(manualMatches);

    // other side effects
    await new Promise((resolve) => setTimeout(resolve, 100));
    createNewJob();
    refetchManualMatchesList();
  };

  useEffect(() => {
    setJobState(status);
    // Populating the initial manualMatches state
    const initialManualMatches = suggestions?.reduce(
      (
        matches: {
          [key: string]: ManualMatch;
        },
        suggestion: ImprovementSuggestion
      ) => {
        const key = suggestion.originExternalId;
        matches[key] = {
          originExternalId: suggestion.originExternalId,
        };
        return matches;
      },
      {}
    );
    setManualMatches(initialManualMatches);
  }, [setManualMatches, status, suggestions]);

  // polling
  useEffect(() => {
    let pollJobStatus: NodeJS.Timer | undefined;

    if (jobId && labelingStage) {
      pollJobStatus = setInterval(() => {
        refetchJobStatus();
      }, POLLING_INTERVAL);
    }

    if (
      status === JobStatus.Completed ||
      status === JobStatus.Failed ||
      !labelingStage
    ) {
      clearInterval(pollJobStatus); // Stop the polling interval
    }

    return () => {
      clearInterval(pollJobStatus);
    };
  }, [labelingStage, status, jobId, refetchJobStatus]);

  const title = 'Match';
  const body = (
    <LabelingBody
      labelingStage={labelingStage}
      jobState={jobState}
      originInstances={originInstances}
      matchInputInstances={matchInputInstances}
      manualMatches={manualMatches}
      setManualMatches={setManualMatches}
      onClickStartLabeling={onClickStartLabeling}
    />
  );
  const footer = labelingStage ? (
    <>
      <Tooltip
        position="left"
        content="Write matches to advanced join and get more match suggestions"
      >
        <Popconfirm
          onConfirm={handleWriteMatchers}
          okText="Proceed"
          content={
            allDefined
              ? 'Proceed: Write Matches'
              : 'Empty Matches Detected. Proceed Anyway?'
          }
        >
          <Button type="primary" icon="Tag">
            Continue
          </Button>
        </Popconfirm>
      </Tooltip>
    </>
  ) : (
    <></>
  );

  return <FormattedContainer title={title} body={body} footer={footer} />;
};
