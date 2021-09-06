import React, { useContext } from 'react';
import { Body, Icon } from '@cognite/cogs.js';
import { AppStateContext } from 'context';
import { Flex } from 'components/Common';
import { useActiveWorkflow } from 'hooks';
import { useJobStatus } from 'modules/contextualization/pnidParsing';
import { useWorkflowAllLoadPercentages } from 'modules/workflows';
import { InfoWrapper } from './components';

export default function ResourcesLoaded() {
  const { jobStarted } = useContext(AppStateContext);
  const { workflowId } = useActiveWorkflow();
  const jobStatus = useJobStatus(workflowId, jobStarted);
  const { isLoaded: areResourcesLoaded, loadedPercent } =
    useWorkflowAllLoadPercentages(Number(workflowId));

  const shouldShowLoadingProgress = jobStatus === 'loading';

  return (
    <Flex row align>
      {!areResourcesLoaded && shouldShowLoadingProgress && (
        <InfoWrapper>
          <Icon type="LoadingSpinner" />
          <Body strong level={2}>
            {loadedPercent}% resources loaded
          </Body>
        </InfoWrapper>
      )}
      {areResourcesLoaded && (
        <InfoWrapper>
          <Icon type="CheckmarkFilled" />
          <Body strong level={2}>
            All resources loaded!
          </Body>
        </InfoWrapper>
      )}
    </Flex>
  );
}
