import React from 'react';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@access-management/common/i18n';
import { useGroups, usePermissions } from '@access-management/hooks';
import CustomInfo from '@access-management/pages/components/CustomInfo';
import { hasAnyValidGroupForOIDC } from '@access-management/pages/Groups/utils';
import { useMutation } from '@tanstack/react-query';
import { notification } from 'antd';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

const LegacyLoginFlowWarning = () => {
  const { t } = useTranslation();
  const sdk = useSDK();
  const { flow } = getFlow();
  const { data: writeOk } = usePermissions('projectsAcl', 'UPDATE');
  const isLoggedInUsingLegacyLoginFlow = flow === 'COGNITE_AUTH';
  const { data: groups, isFetched: areGroupsFetched } = useGroups(true);
  const hasAnyValidGroup = hasAnyValidGroupForOIDC(groups);
  const canLegacyLoginFlowBeDisabled =
    areGroupsFetched && !isLoggedInUsingLegacyLoginFlow && hasAnyValidGroup;

  const navigate = useNavigate();
  const params = useParams<{ tenant: string; path: string }>();

  const { mutate: disableLegacyLoginFlow } = useMutation(
    () => {
      const project = getProject();
      return sdk.post(`/api/v1/projects/${project}/update`, {
        data: {
          update: {
            isLegacyLoginFlowAndApiKeysEnabled: {
              set: false,
            },
          },
        },
      });
    },
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
        if (params) {
          navigate(`/${params.tenant}/${params.path}/oidc`, { replace: true });
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

  if (!writeOk || !areGroupsFetched) {
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
          <StyledIcon $success={!isLoggedInUsingLegacyLoginFlow} />
          {t('legacy-login-flow-login-using-oidc')}
          <br />
          <StyledIcon $success={hasAnyValidGroup} />
          {t('legacy-login-flow-valid-group-info')} <b>groups:create</b>{' '}
          {t('capability').toLocaleLowerCase()}
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
