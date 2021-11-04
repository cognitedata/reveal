import React from 'react';
import { Body, Icon } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import { useActiveWorkflow, useJobStatus } from 'hooks';
import { useWorkflowAllLoadPercentages } from 'modules/workflows';
import { InfoWrapper } from './components';

export default function ResourcesLoaded() {
  const { workflowId } = useActiveWorkflow();
  const jobStatus = useJobStatus();
  const { loadedPercent } = useWorkflowAllLoadPercentages(Number(workflowId));

  const shouldShowLoadingProgress = jobStatus === 'loading';
  const areResourcesLoaded = jobStatus === 'running' || jobStatus === 'done';

  return (
    <Flex row align>
      {shouldShowLoadingProgress && (
        <InfoWrapper>
          <Body strong level={2}>
            {loadedPercent}% resources loaded
          </Body>
        </InfoWrapper>
      )}
      {areResourcesLoaded && (
        <InfoWrapper>
          <Icon type="CheckmarkFilled" />
          <Body strong level={2}>
            All resources loaded
          </Body>
        </InfoWrapper>
      )}
    </Flex>
  );
}
