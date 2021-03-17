import React, { FunctionComponent, PropsWithChildren } from 'react';
import { createLink } from '@cognite/cdf-utilities';
import {
  PageWrapper,
  GridBreadCrumbsWrapper,
  MainWithAsidesWrapper,
} from 'styles/StyledPage';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from 'routing/RoutingConfig';
import { INTEGRATION_OVERVIEW, REGISTER_INTEGRATION } from 'utils/constants';
import { BackBtn } from 'components/buttons/BackBtn';
import { PageTitle } from 'styles/StyledHeadings';

interface RegisterIntegrationLayoutProps {
  backPath?: string;
}

export const RegisterIntegrationLayout: FunctionComponent<RegisterIntegrationLayoutProps> = ({
  backPath,
  children,
}: PropsWithChildren<RegisterIntegrationLayoutProps>) => {
  return (
    <PageWrapper>
      <GridBreadCrumbsWrapper to={createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH)}>
        {INTEGRATION_OVERVIEW}
      </GridBreadCrumbsWrapper>
      <PageTitle>{REGISTER_INTEGRATION}</PageTitle>
      <MainWithAsidesWrapper>
        {backPath && <BackBtn path={backPath} />}
        {children}
      </MainWithAsidesWrapper>
    </PageWrapper>
  );
};
