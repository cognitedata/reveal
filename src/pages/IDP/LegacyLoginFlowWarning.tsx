import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useHistory, useRouteMatch } from 'react-router';

import { Icon } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { notification } from 'antd';
import styled from 'styled-components';
import { useAuthConfiguration, useGroups, usePermissions } from 'hooks';
import { hasAnyValidGroupForOIDC } from 'pages/Groups/utils';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import CustomInfo from 'pages/components/CustomInfo';

const LegacyLoginFlowWarning = () => {
  const sdk = useSDK();
  const client = useQueryClient();
  const { flow } = getFlow();
  const { data: writeOk } = usePermissions('projectsAcl', 'UPDATE');
  const isLoggedInUsingLegacyLoginFlow = flow === 'COGNITE_AUTH';
  const { data: authConfiguration, isFetched: isAuthConfigurationFetched } =
    useAuthConfiguration();
  const isOIDCConfigured = authConfiguration?.isOidcEnabled;
  const { data: groups, isFetched: areGroupsFetched } = useGroups(true);
  const hasAnyValidGroup = hasAnyValidGroupForOIDC(groups);
  const canLegacyLoginFlowBeDisabled =
    isAuthConfigurationFetched &&
    areGroupsFetched &&
    !isLoggedInUsingLegacyLoginFlow &&
    hasAnyValidGroup;

  const history = useHistory();
  const match =
    useRouteMatch<{ tenant: string; path: string }>('/:tenant/:path');

  const { mutate: disableLegacyLoginFlow } = useMutation(
    () =>
      sdk.post(`/api/v1/projects/${sdk.project}/update`, {
        data: {
          update: {
            isLegacyLoginFlowAndApiKeysEnabled: {
              set: false,
            },
          },
        },
      }),
    {
      onMutate() {
        notification.info({
          key: 'disable-legacy-login-flow',
          message: 'Disabling legacy login flow',
        });
      },
      onSuccess() {
        notification.success({
          key: 'disable-legacy-login-flow',
          message: 'Legacy login flow is disabled',
        });
        client.invalidateQueries('auth-configuration');
        if (match?.params) {
          history.push(`/${match.params.tenant}/${match.params.path}/oidc`);
        }
      },
      onError() {
        notification.error({
          key: 'disable-legacy-login-flow',
          message: 'Legacy login flow is not disabled!',
          description: 'An error occured while disabling legacy login flow',
        });
      },
    }
  );

  const handleSubmit = () => {
    disableLegacyLoginFlow();
  };

  if (!writeOk || !isAuthConfigurationFetched || !areGroupsFetched) {
    return <></>;
  }

  return (
    <CustomInfo
      type="danger"
      alertTitle="Deprecate Legacy Login"
      alertMessage={
        <p>
          We are deprecating authentication via CDF service accounts and API
          keys in favor of OIDC. We strongly encourage customers to adopt{' '}
          <a
            href="https://docs.cognite.com/cdf/access/"
            target="_blank"
            rel="noopener noreferrer"
          >
            the new authentication flows
          </a>{' '}
          as soon as possible.
        </p>
      }
      alertBtnLabel="Deprecate Legacy Login"
      alertBtnDisabled={!writeOk || !canLegacyLoginFlowBeDisabled}
      helpEnabled
      helpTooltipMessage={
        <p>
          Before you can deprecate legacy login, you must:
          <br />
          <StyledIcon $success={isOIDCConfigured} />
          Configure OIDC for your project
          <br />
          <StyledIcon $success={!isLoggedInUsingLegacyLoginFlow} />
          Log in using OIDC
          <br />
          <StyledIcon $success={hasAnyValidGroup} />
          Have a group in your project that has a source ID and the{' '}
          <b>groups:create</b> capability
        </p>
      }
      confirmTitle="Deprecate Legacy Login"
      confirmMessage="deprecate legacy login"
      onClickConfirm={handleSubmit}
    />
  );
};

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

export default LegacyLoginFlowWarning;
