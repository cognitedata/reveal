import { Dispatch, SetStateAction, useState } from 'react';

import styled from 'styled-components';

import { Button, Icon, Tooltip } from '@cognite/cogs.js';

import { MatchTable } from '../containers/MatchTable';
import { InternalModelInstance, JobStatus, ManualMatch } from '../types';

import { InstructionsModal } from './InstructionsModal';
import { SectionDivider } from './SectionDivider';
import { Spinner } from './Spinner/Spinner';

export const LabelingBody = ({
  labelingStage,
  jobState,
  originInstances,
  matchInputInstances,
  manualMatches,
  setManualMatches,
  onClickStartLabeling,
}: {
  labelingStage: boolean;
  jobState: JobStatus | undefined;
  originInstances: InternalModelInstance[];
  matchInputInstances: InternalModelInstance[];
  manualMatches: {
    [key: string]: ManualMatch;
  };
  setManualMatches: Dispatch<
    SetStateAction<{
      [key: string]: ManualMatch;
    }>
  >;
  onClickStartLabeling: () => void;
}) => {
  const [instructionsVisibility, setInstructionsVisibility] =
    useState<boolean>(false);
  if (!labelingStage) {
    return (
      <>
        {/* <p>
          Select a RAW table that contain columns that can be used as a
          reference for this advanced join.
          <br />
          The RAW table will typically be the output of an entity matching job
          or a similar matching process with som uncertainty.
        </p>
        <IconButton
          type="primary"
          icon="DataTableImport"
          tooltipContent="Select a raw table to assist your thing"
        >
          Select RAW table
        </IconButton>
        <SectionDivider />
        <p>
          You can also proceed without a RAW table, but if you’re not an SME the
          correctness of the matches will initially be unknown.
        </p> */}
        <p>
          Start creating manual matches in order to be able to get an estimated
          score of how well your data is contextualized and improve your data
          foundation over time.
        </p>
        <div style={{ width: 'fit-content' }}>
          <Tooltip position="bottom" content="Start creating manual matches">
            <Button type="primary" icon="Tag" onClick={onClickStartLabeling}>
              Start creating manual matches
            </Button>
          </Tooltip>
        </div>
        <SectionDivider />
      </>
    );
  }

  switch (jobState) {
    case JobStatus.Failed:
      return (
        <>
          <Icon type="Error" />
        </>
      );

    case JobStatus.Completed:
      return (
        <>
          <div>
            <Button
              type="ghost"
              onClick={() => {
                setInstructionsVisibility(true);
              }}
            >
              Click here for instructions
            </Button>
          </div>
          <InstructionsModal
            instructionsVisibility={instructionsVisibility}
            setInstructionsVisibility={setInstructionsVisibility}
          />

          {originInstances && (
            <LabelingTableContainer>
              <MatchTable
                originInstances={originInstances}
                matchInputInstances={matchInputInstances}
                manualMatches={manualMatches}
                setManualMatches={setManualMatches}
              />
            </LabelingTableContainer>
          )}
        </>
      );

    case JobStatus.Running:
    case JobStatus.Queued:
    default:
      return (
        <>
          <Spinner />
        </>
      );
  }
};

const LabelingTableContainer = styled.div`
  display: flex;
  max-height: calc(100vh - 315px);
`;
