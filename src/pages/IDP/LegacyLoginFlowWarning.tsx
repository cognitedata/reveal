import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useHistory, useRouteMatch } from 'react-router';

import { Button, Colors, Icon, Tooltip } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { Alert as AntdAlert, Modal, notification } from 'antd';
import styled from 'styled-components';
import { useAuthConfiguration, useGroups, usePermissions } from 'hooks';
import { hasAnyValidGroupForOIDC } from 'pages/Groups/utils';
import { getFlow } from '@cognite/cdf-sdk-singleton';

const NUMBER_OF_SECONDS_TO_ALLOW_DISABLING = 5;

const StyledAlert = styled(AntdAlert)`
  margin-bottom: 16px;
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

const StyledModalContent = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
`;

const StyledModalWarningIcon = styled(Icon)`
  color: ${Colors.danger};
  margin-right: 8px;
`;

const StyledModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const StyledModalButton = styled(Button)`
  :not(:last-child) {
    margin-right: 12px;
  }
`;

const StyledDisableButtonSection = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 4px;
`;

const StyledHelpIcon = styled(Icon)`
  color: ${Colors['text-hint']};
  margin: 4px 0 0 8px;
`;

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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(
    NUMBER_OF_SECONDS_TO_ALLOW_DISABLING
  );
  const timerRef = useRef<NodeJS.Timeout>();

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
    closeModal();
  };

  const closeModal = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setRemainingTime(NUMBER_OF_SECONDS_TO_ALLOW_DISABLING);
    setIsModalVisible(false);
  };

  const openModal = () => {
    const decrementRemainingTime = () => {
      timerRef.current = setTimeout(() => {
        setRemainingTime(prevRemainingTime => {
          const decrementedRemainingTime = prevRemainingTime - 1;
          if (decrementedRemainingTime > 0) {
            decrementRemainingTime();
          }
          return decrementedRemainingTime;
        });
      }, 1000);
    };

    decrementRemainingTime();
    setIsModalVisible(true);
  };

  if (!writeOk || !isAuthConfigurationFetched || !areGroupsFetched) {
    return <></>;
  }

  return (
    <StyledAlert
      message={
        <>
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
          <StyledDisableButtonSection>
            <Button
              disabled={!writeOk || !canLegacyLoginFlowBeDisabled}
              onClick={openModal}
              type="danger"
            >
              Deprecate Legacy Login
            </Button>
            <Tooltip
              content={
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
            >
              <StyledHelpIcon size={20} type="HelpFilled" />
            </Tooltip>
          </StyledDisableButtonSection>
          <Modal footer={null} onCancel={closeModal} visible={isModalVisible}>
            <StyledModalContent>
              <StyledModalWarningIcon size={20} type="WarningStroke" />
              Are you sure you want to deprecate legacy login?
            </StyledModalContent>
            <StyledModalButtons>
              <StyledModalButton onClick={closeModal} type="tertiary">
                Cancel
              </StyledModalButton>
              <StyledModalButton
                disabled={
                  !writeOk || !canLegacyLoginFlowBeDisabled || remainingTime > 0
                }
                onClick={handleSubmit}
                type="danger"
              >
                Deprecate
                {remainingTime > 0 ? ` (${remainingTime})` : ''}
              </StyledModalButton>
            </StyledModalButtons>
          </Modal>
        </>
      }
      type="error"
    />
  );
};

export default LegacyLoginFlowWarning;
