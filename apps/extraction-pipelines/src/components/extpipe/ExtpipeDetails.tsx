import React, { FunctionComponent, useEffect } from 'react';
import styled from 'styled-components';

import { PageWrapperColumn } from 'components/styled';
import { DocumentationSection } from 'components/extpipe/DocumentationSection';
import { RunScheduleConnection } from 'components/extpipe/RunScheduleConnection';
import { ExtpipeInformation } from 'components/extpipe/ExtpipeInformation';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { EXTPIPES_WRITES } from 'model/AclAction';
import { trackUsage } from 'utils/Metrics';
import { useTranslation } from 'common';
import ConfigurationSection from 'components/extpipe/ConfigurationSection';
import { useSelectedExtpipe, useSelectedExtpipeId } from 'hooks/useExtpipe';
import { ExtpipeBreadcrumbs } from 'components/navigation/breadcrumbs/ExtpipeBreadcrumbs';
import { ExtpipeHeading } from './ExtpipeHeading';
import { Loader } from '@cognite/cogs.js';

interface ExtpipeViewProps {}

export const ExtpipeDetails: FunctionComponent<ExtpipeViewProps> = () => {
  const { t } = useTranslation();
  const id = useSelectedExtpipeId();
  const { data: extpipe, isLoading } = useSelectedExtpipe();
  const permissions = useOneOfPermissions(EXTPIPES_WRITES);
  const canEdit = permissions.data;

  useEffect(() => {
    if (id) {
      trackUsage({ t: 'Extraction pipeline.Details', id });
    }
  }, [id]);

  if (isLoading) {
    return <Loader />;
  }

  if (!extpipe) {
    return <p>{t('ext-pipeline-id-not-found', { id })}</p>;
  }
  return (
    <>
      <ExtpipeBreadcrumbs extpipe={extpipe} />
      <ExtpipeHeading />
      <PageWrapperColumn>
        <TopSection>
          <RunScheduleConnection externalId={extpipe.externalId} />
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
    </>
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
