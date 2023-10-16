import React from 'react';

import { Body, Title, Chip } from '@cognite/cogs.js';

import { Flex } from '../../../components/Common';
import {
  useJobStatus,
  useGoToStep,
  useSavedSettings,
  useResourceCount,
  useJobStatusLabels,
  useJobStarted,
} from '../../../hooks';
import { ResourceType } from '../../../modules/types';

import { DetailsWrapper, SetUpWrapper } from './components';
import ModelInfo from './ModelInfo';
import RunModelButton from './RunModelButton';
import SelectionInfo from './SelectionInfo';

export default function SectionSetup(): JSX.Element {
  const { jobStarted } = useJobStarted();
  const { goToStep } = useGoToStep();
  const { jobLabel, labelVariant } = useJobStatusLabels();
  const { modelSelected } = useSavedSettings();
  const jobStatus = useJobStatus();
  const allCounts = useResourceCount();

  const optionalResources = ['files', 'assets'];
  const isAnyOptionalResourceSelected = Boolean(
    optionalResources.filter(
      (resourceType) => allCounts[resourceType as ResourceType]
    )?.length
  );

  const onModelClick = () => goToStep('config');
  const getLinkedResources = () =>
    optionalResources.map<React.ReactNode>((resourceType, index: number) => (
      <React.Fragment key={`selection-badge-${resourceType}`}>
        {!!index && 'and'}
        <SelectionInfo
          editable={!jobStarted}
          type={resourceType as ResourceType}
          count={allCounts[resourceType as ResourceType]}
          data-testid={`${resourceType}-selection-info`}
        />
      </React.Fragment>
    ));

  return (
    <SetUpWrapper jobStatus={jobStatus} data-testid="setup-summary">
      <Flex column>
        <Flex row align style={{ justifyContent: 'space-between' }}>
          <Title level={5}>Setup for creating interactive diagrams</Title>
          <Chip label={jobLabel} size="small" type={labelVariant} />
        </Flex>
        <DetailsWrapper>
          {jobStatus === 'incomplete' ? (
            <>
              {!allCounts.diagrams && (
                <Flex row align>
                  <Body level={2} style={{ whiteSpace: 'nowrap' }}>
                    No engineering diagrams selected.{' '}
                  </Body>
                  <SelectionInfo
                    text="Select diagrams"
                    editable={!jobStarted}
                    type="diagrams"
                    count={allCounts.diagrams}
                  />
                </Flex>
              )}
              {!isAnyOptionalResourceSelected && (
                <Flex row align>
                  <Body level={2} style={{ whiteSpace: 'nowrap' }}>
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
                data-testid="diagrams-selection-info"
              />
              <Body level={2} style={{ whiteSpace: 'nowrap' }}>
                will be linked to
              </Body>
              {getLinkedResources()}
              <Body level={2}>on</Body>
              <ModelInfo
                editable={!jobStarted}
                onClick={onModelClick}
                data-testid="model-selection-info"
              >
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
