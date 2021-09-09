import React from 'react';

import { Button as CogsButton, Icon } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { Alert as AntdAlert, Tooltip } from 'antd';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

const StyledAlert = styled(AntdAlert)`
  margin-bottom: 16px;
`;

const StyledButton = styled(CogsButton)`
  margin: 0 8px 4px 0;
`;

const StyledIcon = styled(Icon).attrs(({ $success }: { $success: boolean }) => {
  return {
    size: 12,
    type: $success ? 'Checkmark' : 'Close',
  };
})<{ $success?: boolean }>`
  margin-right: 6px;
  color: ${({ $success }) =>
    $success ? 'var(--cogs-success)' : 'var(--cogs-danger)'};
`;

const LegacyLoginFlowWarning = () => {
  const sdk = useSDK();
  const flow = sdk.getOAuthFlowType();
  const { data: writeOk } = usePermissions('projectsAcl', 'UPDATE');
  const isLoggedInUsingLegacyLoginFlow = flow === 'CDF_OAUTH';
  const { data: authSettings, isFetched } = useQuery('auth-settings', () => {
    return sdk
      .get<{ isOidcEnabled: boolean }>(
        `/api/playground/projects/${sdk.project}/configuration`
      )
      .then(r => r.data);
  });
  const isOIDCConfigured = authSettings?.isOidcEnabled;
  const canLegacyLoginFlowBeDisabled =
    isFetched && isOIDCConfigured && isLoggedInUsingLegacyLoginFlow;

  return (
    <StyledAlert
      message={
        <>
          <p>
            We are deprecating authentication via CDF service accounts and API
            keys in favor of registering applications and services with your IdP
            (identity provider) and{' '}
            <a
              href="https://docs.cognite.com/cdf/access/"
              target="_blank"
              rel="noopener noreferrer"
            >
              using OpenID Connect
            </a>{' '}
            and the IdP framework to manage CDF access securely. We strongly
            encourage customers to adopt{' '}
            <a
              href="https://docs.cognite.com/cdf/access/"
              target="_blank"
              rel="noopener noreferrer"
            >
              the new authentication flows
            </a>{' '}
            as soon as possible.
          </p>
          <Tooltip
            title={
              !canLegacyLoginFlowBeDisabled && (
                <div>
                  Before you can disable legacy login flow, you should:
                  <br />
                  <StyledIcon $success={isOIDCConfigured} />
                  Configure OIDC for your project
                  <br />
                  <StyledIcon $success={isLoggedInUsingLegacyLoginFlow} />
                  Log in using OIDC
                </div>
              )
            }
            arrowPointAtCenter
          >
            <StyledButton
              disabled={!writeOk || !canLegacyLoginFlowBeDisabled}
              type="danger"
            >
              Disable Legacy Login Flow
            </StyledButton>
          </Tooltip>
        </>
      }
      type="error"
    />
  );
};

export default LegacyLoginFlowWarning;
