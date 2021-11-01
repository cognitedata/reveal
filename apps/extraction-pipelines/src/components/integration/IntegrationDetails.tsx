import React, { FunctionComponent, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { RouterParams } from 'routing/RoutingConfig';
import { EXTRACTION_PIPELINE_LOWER } from 'utils/constants';
import { PageWrapperColumn } from 'styles/StyledPage';
import { DocumentationSection } from 'components/integration/DocumentationSection';
import { RunScheduleConnection } from 'components/integration/RunScheduleConnection';
import { IntegrationInformation } from 'components/integration/IntegrationInformation';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { EXTPIPES_WRITES } from 'model/AclAction';
import { trackUsage } from 'utils/Metrics';

const MiddleSection = styled.div`
  display: flex;
  margin-bottom: 1rem;
  gap: 1rem;
`;
const TopSection = styled.section`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
`;

export const createNoIntegrationFoundMessage = (id: string): Readonly<string> =>
  `Found no ${EXTRACTION_PIPELINE_LOWER} with id: ${id}`;

interface IntegrationViewProps {}

export const IntegrationDetails: FunctionComponent<IntegrationViewProps> = () => {
  const { id } = useParams<RouterParams>();
  // take as param??
  const { integration } = useSelectedIntegration();
  const integrationId = integration?.id;
  const permissions = useOneOfPermissions(EXTPIPES_WRITES);
  const canEdit = permissions.data;

  useEffect(() => {
    if (integrationId) {
      trackUsage({ t: 'Extraction pipeline.Details', id: integrationId });
    }
  }, [integrationId]);

  if (!integration) {
    return <p>{createNoIntegrationFoundMessage(id)}</p>;
  }
  return (
    <PageWrapperColumn>
      <TopSection>
        <RunScheduleConnection />
      </TopSection>
      <MiddleSection>
        <div css="flex: 2;">
          <DocumentationSection canEdit={canEdit} />
        </div>
        <div css="flex: 1; max-width: 35%">
          <IntegrationInformation canEdit={canEdit} />
        </div>
      </MiddleSection>
    </PageWrapperColumn>
  );
};
