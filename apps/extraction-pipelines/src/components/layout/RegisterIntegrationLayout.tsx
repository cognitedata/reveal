import React, { FunctionComponent, PropsWithChildren } from 'react';
import {
  PageWrapper,
  GridBreadCrumbsWrapper,
  MainWithAsidesWrapper,
} from 'styles/StyledPage';
import {
  EXTRACTION_PIPELINE_OVERVIEW,
  ADD_EXTRACTION_PIPELINE,
} from 'utils/constants';
import { BackBtn } from 'components/buttons/BackBtn';
import { PageTitle } from 'styles/StyledHeadings';
import { createExtPipePath } from 'utils/baseURL';

interface RegisterIntegrationLayoutProps {
  backPath?: string;
}

export const RegisterIntegrationLayout: FunctionComponent<RegisterIntegrationLayoutProps> = ({
  backPath,
  children,
}: PropsWithChildren<RegisterIntegrationLayoutProps>) => {
  return (
    <PageWrapper>
      <GridBreadCrumbsWrapper to={createExtPipePath()}>
        {EXTRACTION_PIPELINE_OVERVIEW}
      </GridBreadCrumbsWrapper>
      <PageTitle>{ADD_EXTRACTION_PIPELINE}</PageTitle>
      <MainWithAsidesWrapper>
        {backPath && <BackBtn path={backPath} />}
        {children}
      </MainWithAsidesWrapper>
    </PageWrapper>
  );
};
