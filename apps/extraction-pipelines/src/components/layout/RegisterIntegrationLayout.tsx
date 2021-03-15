import React, { FunctionComponent, PropsWithChildren } from 'react';
import { createLink } from '@cognite/cdf-utilities';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from 'styles/StyledPage';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from 'routing/RoutingConfig';
import { INTEGRATION_OVERVIEW, REGISTER_INTEGRATION } from 'utils/constants';
import { BackBtn } from 'components/buttons/BackBtn';

interface RegisterIntegrationLayoutProps {
  backPath?: string;
}

export const RegisterIntegrationLayout: FunctionComponent<RegisterIntegrationLayoutProps> = ({
  backPath,
  children,
}: PropsWithChildren<RegisterIntegrationLayoutProps>) => {
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH)}>
        {INTEGRATION_OVERVIEW}
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>{REGISTER_INTEGRATION}</GridTitleWrapper>
      <GridMainWrapper>
        {backPath && <BackBtn path={backPath} />}
        {children}
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
