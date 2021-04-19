import React, { FunctionComponent, useEffect } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { useParams } from 'react-router';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { RouterParams } from 'routing/RoutingConfig';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_INTEGRATION } from 'utils/constants';
import { GeneralInfoSection } from 'components/integration/GeneralInfoSection';
import { PageWrapperColumn } from 'styles/StyledPage';
import { DocumentationSection } from 'components/integration/DocumentationSection';
import { LatestRun } from 'components/integration/LatestRun';
import { RunScheduleHartbeat } from 'components/integration/RunScheduleHartbeat';

const MiddleSection = styled.section`
  padding: 1rem;
  border-bottom: 1px solid ${Colors['greyscale-grey7'].hex()};
  margin-bottom: 1rem;
`;
const MiddleSectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${Colors['greyscale-grey7'].hex()};
`;
const TopSection = styled.section`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const BottomSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 2rem;
`;

export const createNoIntegrationFoundMessage = (id: string): Readonly<string> =>
  `Found no integration with id: ${id}`;

interface IntegrationViewProps {}
export const IntegrationView: FunctionComponent<IntegrationViewProps> = () => {
  const { id } = useParams<RouterParams>();
  const { integration } = useSelectedIntegration();
  const integrationId = integration?.id;

  useEffect(() => {
    if (integrationId) {
      trackUsage(SINGLE_INTEGRATION, { id: integrationId });
    }
  }, [integrationId]);

  if (!integration) {
    return <p>{createNoIntegrationFoundMessage(id)}</p>;
  }
  return (
    <PageWrapperColumn>
      <TopSection>
        <RunScheduleHartbeat />
      </TopSection>
      <MiddleSection>
        <LatestRun integration={integration} />
      </MiddleSection>
      <MiddleSectionGrid>
        <GeneralInfoSection />
      </MiddleSectionGrid>
      <BottomSection>
        <DocumentationSection />
      </BottomSection>
    </PageWrapperColumn>
  );
};
