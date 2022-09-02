import React, { FunctionComponent, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { RouterParams } from 'routing/RoutingConfig';
import { PageWrapperColumn } from 'components/styled';
import { DocumentationSection } from 'components/extpipe/DocumentationSection';
import { RunScheduleConnection } from 'components/extpipe/RunScheduleConnection';
import { ExtpipeInformation } from 'components/extpipe/ExtpipeInformation';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { EXTPIPES_WRITES } from 'model/AclAction';
import { trackUsage } from 'utils/Metrics';
import { useTranslation } from 'common';
import ConfigurationSection from 'components/extpipe/ConfigurationSection';

interface ExtpipeViewProps {}

export const ExtpipeDetails: FunctionComponent<ExtpipeViewProps> = () => {
  const { t } = useTranslation();
  const { id } = useParams<RouterParams>();
  // take as param??
  const { extpipe } = useSelectedExtpipe();
  const extpipeId = extpipe?.id;
  const permissions = useOneOfPermissions(EXTPIPES_WRITES);
  const canEdit = permissions.data;

  useEffect(() => {
    if (extpipeId) {
      trackUsage({ t: 'Extraction pipeline.Details', id: extpipeId });
    }
  }, [extpipeId]);

  if (!extpipe) {
    return <p>{t('ext-pipeline-id-not-found', { id })}</p>;
  }
  return (
    <PageWrapperColumn>
      <TopSection>
        <RunScheduleConnection />
      </TopSection>
      <MiddleSection>
        <div css="flex: 2;">
          <DocumentationSection canEdit={canEdit} />
          {extpipe?.externalId && (
            <ConfigurationSection externalId={extpipe?.externalId} />
          )}
        </div>
        <div css="flex: 1; max-width: 35%">
          <ExtpipeInformation canEdit={canEdit} />
        </div>
      </MiddleSection>
    </PageWrapperColumn>
  );
};

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
