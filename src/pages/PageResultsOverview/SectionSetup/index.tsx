import React, { useContext } from 'react';
import { Body, Title, Label } from '@cognite/cogs.js';
import { AppStateContext } from 'context';
import { ResourceType } from 'modules/types';
import { useJobStatus } from 'modules/contextualization/pnidParsing';
import {
  useActiveWorkflow,
  useGoToStep,
  useSavedSettings,
  useResourceCount,
  useJobStatusLabels,
} from 'hooks';
import { Flex } from 'components/Common';
import { DetailsWrapper, SetUpWrapper } from './components';
import ModelInfo from './ModelInfo';
import SelectionInfo from './SelectionInfo';
import RunModelButton from './RunModelButton';

export default function SectionSetup(): JSX.Element {
  const { jobStarted } = useContext(AppStateContext);
  const { goToStep } = useGoToStep();
  const { jobLabel, labelVariant } = useJobStatusLabels();
  const { modelSelected } = useSavedSettings();
  const { workflowId } = useActiveWorkflow();
  const jobStatus = useJobStatus(workflowId, jobStarted);
  const allCounts = useResourceCount();

  const optionalResources = ['files', 'assets'];

  const onModelClick = () => goToStep('config');
  const getLinkedResources = () =>
    optionalResources.map<React.ReactNode>((resourceType, index: number) => (
      <React.Fragment key={`selection-badge-${resourceType}`}>
        {!!index && 'and'}
        <SelectionInfo
          editable={!jobStarted}
          type={resourceType as ResourceType}
          count={allCounts[resourceType as ResourceType]}
        />
      </React.Fragment>
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
          {jobStatus === 'incomplete' ? (
            <>
              {!allCounts.diagrams && (
                <Flex row align>
                  <Body level={2}>No engineering diagrams selected. </Body>
                  <SelectionInfo
                    text="Select diagrams"
                    editable={!jobStarted}
                    type="diagrams"
                    count={allCounts.diagrams}
                  />
                </Flex>
              )}
              {!getLinkedResources()?.length && (
                <Flex row align>
                  <Body level={2}>
                    At least one resource type must be selected.
                  </Body>
                  <SelectionInfo
                    text="Select assets"
                    editable={!jobStarted}
                    type="assets"
                    count={allCounts.assets}
                  />
                  <Body level={2}>or</Body>
                  <SelectionInfo
                    text="Select files"
                    editable={!jobStarted}
                    type="files"
                    count={allCounts.files}
                  />
                </Flex>
              )}
            </>
          ) : (
            <Flex row align style={{ flexWrap: 'wrap' }}>
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
            </Flex>
          )}
        </DetailsWrapper>
      </Flex>
      <RunModelButton />
    </SetUpWrapper>
  );
}
