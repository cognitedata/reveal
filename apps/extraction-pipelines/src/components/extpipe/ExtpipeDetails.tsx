import React, { FunctionComponent, useEffect } from 'react';

import styled from 'styled-components';

import { Loader } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  useSelectedExtpipe,
  useSelectedExtpipeId,
} from '../../hooks/useExtpipe';
import { trackUsage } from '../../utils/Metrics';
import { PageWrapperColumn, StyledPageContainer } from '../styled';

import ConfigurationSection from './ConfigurationSection';
import { DocumentationSection } from './DocumentationSection';
import { ExtpipeHeading } from './ExtpipeHeading';
import { ExtpipeInformation } from './ExtpipeInformation';
import { RunScheduleConnection } from './RunScheduleConnection';

export const ExtpipeDetails: FunctionComponent = () => {
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
