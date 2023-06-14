import React, { FunctionComponent, useEffect } from 'react';
import styled from 'styled-components';

import { PageWrapperColumn, StyledPageContainer } from 'components/styled';
import { DocumentationSection } from 'components/extpipe/DocumentationSection';
import { RunScheduleConnection } from 'components/extpipe/RunScheduleConnection';
import { ExtpipeInformation } from 'components/extpipe/ExtpipeInformation';

import { trackUsage } from 'utils/Metrics';
import { useTranslation } from 'common';
import ConfigurationSection from 'components/extpipe/ConfigurationSection';
import { useSelectedExtpipe, useSelectedExtpipeId } from 'hooks/useExtpipe';
import { ExtpipeHeading } from './ExtpipeHeading';
import { Loader } from '@cognite/cogs.js';

interface ExtpipeViewProps {}

export const ExtpipeDetails: FunctionComponent<ExtpipeViewProps> = () => {
  const { t } = useTranslation();
  const id = useSelectedExtpipeId();
  const { data: extpipe, isInitialLoading } = useSelectedExtpipe();

  useEffect(() => {
    if (id) {
      trackUsage({ t: 'Extraction pipeline.Details', id });
    }
  }, [id]);

  if (isInitialLoading) {
    return <Loader />;
  }

  if (!extpipe) {
    return <p>{t('ext-pipeline-id-not-found', { id })}</p>;
  }
  return (
    <StyledPageContainer>
      <ExtpipeHeading />
      <PageWrapperColumn>
        <RunScheduleConnection externalId={extpipe.externalId} />
        <MiddleSection>
          <div css="width: calc(100% - 416px);">
            <DocumentationSection canEdit={true} />
            {extpipe?.externalId && (
              <ConfigurationSection externalId={extpipe?.externalId} />
            )}
          </div>
          <div css="width: 400px">
            <ExtpipeInformation canEdit={true} />
          </div>
        </MiddleSection>
      </PageWrapperColumn>
    </StyledPageContainer>
  );
};

const MiddleSection = styled.div`
  display: flex;
  gap: 16px;
`;
