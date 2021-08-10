import React from 'react';
import { Body, Icon } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import { useActiveWorkflow } from 'hooks';
import { useJobStatus } from 'modules/contextualization/pnidParsing';
import { useWorkflowAllLoadPercentages } from 'modules/workflows';
import { InfoWrapper } from './components';

type Props = { jobStarted: boolean };
export default function ResourcesLoaded(props: Props) {
  const { jobStarted } = props;
  const { workflowId } = useActiveWorkflow();
  const jobStatus = useJobStatus(workflowId, jobStarted);
  const { isLoaded, loadedPercent } = useWorkflowAllLoadPercentages(
    Number(workflowId)
  );

  const areResourcesLoaded = isLoaded && jobStatus !== 'loading';

  return (
    <Flex row align>
      {!areResourcesLoaded && (
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
