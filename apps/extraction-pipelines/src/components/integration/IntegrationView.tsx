import React, { FunctionComponent, useEffect } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { useParams } from 'react-router';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { RouterParams } from 'routing/RoutingConfig';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_INTEGRATION } from 'utils/constants';
import { bottomSpacing } from 'styles/StyledVariables';
import { GeneralInfoSection } from 'components/integration/GeneralInfoSection';
import { StyledTitle3 } from 'styles/StyledHeadings';
import { PageWrapperColumn } from 'styles/StyledPage';
import { LatestRun } from 'components/integration/LatestRun';

export const Hint = styled.span``;

export const AdditionalInfo = styled.i`
  color: ${Colors['greyscale-grey6'].hex()};
  margin-bottom: ${bottomSpacing};
`;

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
  background: ${Colors['midblue-7'].hex()};
`;

const StyledSection = styled.section`
  margin: 1rem;
  width: 50%;
`;
const TitleBlue = styled(StyledTitle3)`
  font-size: 1.1rem;
  color: ${Colors.primary.hex()};
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
        <span>Health</span>
        <StyledSection>
          <TitleBlue>Please register integration information!</TitleBlue>
          <p>
            For users of data it is essential to understand and know the data
            integrated. To help reaching this understanding, please register as
            many details as possible for your integration. Thanks!
          </p>
        </StyledSection>
        <span>Integration information</span>
      </TopSection>
      <MiddleSection>
        <LatestRun integration={integration} />
      </MiddleSection>
      <MiddleSectionGrid>
        <GeneralInfoSection />
      </MiddleSectionGrid>
      <BottomSection />
    </PageWrapperColumn>
  );
};
