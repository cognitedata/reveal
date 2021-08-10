import React from 'react';
import { Body, Title, Label } from '@cognite/cogs.js';
import { ResourceType } from 'modules/types';
import { useJobStatus } from 'modules/contextualization/pnidParsing';
import {
  useActiveWorkflow,
  useGoToStep,
  useSavedSettings,
  useResourceCount,
} from 'hooks';
import { Flex } from 'components/Common';
import { DetailsWrapper, SetUpWrapper } from './components';
import { useLabels } from './useLabels';
import ModelInfo from './ModelInfo';
import SelectionInfo from './SelectionInfo';
import RunModelButton from './RunModelButton';

type Props = {
  jobStarted: boolean;
  setJobStarted: (jobStarted: boolean) => void;
};

export default function SectionSetup(props: Props): JSX.Element {
  const { jobStarted, setJobStarted } = props;
  const { goToStep } = useGoToStep();
  const { jobLabel, labelVariant } = useLabels(jobStarted);
  const { modelSelected } = useSavedSettings();
  const { workflowId } = useActiveWorkflow();
  const jobStatus = useJobStatus(workflowId, jobStarted);
  const allCounts = useResourceCount();

  const onModelClick = () => goToStep('config');
  const getLinkedResources = () =>
    Object.keys(allCounts)
      .filter((resourceType) => resourceType !== 'diagrams')
      .map<React.ReactNode>((resourceType, index: number) => (
        <>
          {!!index && 'and'}
          <SelectionInfo
            editable={!jobStarted}
            type={resourceType as ResourceType}
            count={allCounts[resourceType as ResourceType]}
          />
        </>
      ));

  return (
    <SetUpWrapper jobStatus={jobStatus}>
      <Flex column>
        <Flex row align style={{ justifyContent: 'space-between' }}>
          <Title level={5} style={{}}>
            Set up for creating interactive diagrams
          </Title>
          <Label size="small" variant={labelVariant}>
            {jobLabel}
          </Label>
        </Flex>
        <DetailsWrapper>
          <SelectionInfo
            editable={!jobStarted}
            type="diagrams"
            count={allCounts.diagrams}
          />
          <Body level={2}>will be linked to</Body>
          {getLinkedResources()}
          <Body level={2}>on</Body>
          <ModelInfo editable={!jobStarted} onClick={onModelClick}>
            {modelSelected}
          </ModelInfo>
          <Body level={2}>model.</Body>
        </DetailsWrapper>
      </Flex>
      <RunModelButton jobStarted={jobStarted} setJobStarted={setJobStarted} />
    </SetUpWrapper>
  );
}
