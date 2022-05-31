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
import { useTranslation } from 'common/i18n';

const LegacyLoginFlowWarning = () => {
  const { t } = useTranslation();
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
          message: t('legacy-login-flow-disable'),
        });
      },
      onSuccess() {
        notification.success({
          key: 'disable-legacy-login-flow',
          message: t('legacy-login-flow-disable-success'),
        });
        client.invalidateQueries('auth-configuration');
        if (match?.params) {
          history.push(`/${match.params.tenant}/${match.params.path}/oidc`);
        }
      },
      onError() {
        notification.error({
          key: 'disable-legacy-login-flow',
          message: t('legacy-login-flow-disable-fail'),
          description: t('legacy-login-flow-disable-error'),
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
      alertTitle={t('legacy-login-flow-deprecate')}
      alertMessage={
        <p>
          {t('legacy-login-flow-info')}{' '}
          <a
            href="https://docs.cognite.com/cdf/access/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('legacy-login-flow-new-auth-flow')}{' '}
          </a>
          {t('legacy-login-flow-info-more')}
        </p>
      }
      alertBtnLabel={t('legacy-login-flow-deprecate')}
      alertBtnDisabled={!writeOk || !canLegacyLoginFlowBeDisabled}
      helpEnabled
      helpTooltipMessage={
        <p>
          {t('legacy-login-flow-desc')}
          <br />
          <StyledIcon $success={isOIDCConfigured} />
          {t('legacy-login-flow-configure-oidc')}
          <br />
          <StyledIcon $success={!isLoggedInUsingLegacyLoginFlow} />
          {t('legacy-login-flow-login-using-oidc')}
          <br />
          <StyledIcon $success={hasAnyValidGroup} />
          {t('legacy-login-flow-valid-group-info')} <b>groups:create</b>{' '}
          {t('capability_one').toLocaleLowerCase()}
        </p>
      }
      confirmTitle={t('legacy-login-flow-deprecate')}
      confirmMessage={t('legacy-login-flow-deprecate').toLocaleLowerCase()}
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
