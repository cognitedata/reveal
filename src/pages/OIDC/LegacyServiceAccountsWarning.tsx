import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { Button, Colors, Icon } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { Alert as AntdAlert, Modal, notification } from 'antd';
import styled from 'styled-components';
import { usePermissions } from 'hooks';
import { ServiceAccount } from '@cognite/sdk';

const NUMBER_OF_SECONDS_TO_ALLOW_DISABLING = 5;

const StyledAlert = styled(AntdAlert)`
  margin-bottom: 16px;
`;

const StyledModalContent = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
`;

const StyledModalWarningIcon = styled(Icon)`
  color: ${Colors.warning};
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

const LegacyServiceAccountsWarning = (props: { accounts: ServiceAccount[] }) => {
  const { accounts } = props
  const sdk = useSDK();
  const client = useQueryClient();
  const { data: writeOk } = usePermissions('projectsAcl', 'UPDATE');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(
    NUMBER_OF_SECONDS_TO_ALLOW_DISABLING
  );
  const timerRef = useRef<NodeJS.Timeout>();

  const { mutate: deleteLegacyServiceAccounts } = useMutation(
    (accIDs: number[]) =>
      sdk.post(`/api/v1/projects/${sdk.project}/serviceaccounts/delete`, {
        data: {
          items: accIDs,
        },
      }),
    {
      onMutate() {
        notification.info({
          key: 'delete-legacy-service-accounts',
          message: 'Deleting Legacy Service Accounts',
        });
      },
      onSuccess() {
        debugger
        notification.success({
          key: 'delete-legacy-service-accounts',
          message: 'Legacy Service Accounts are deleted successfully',
        });
        client.invalidateQueries(['service-accounts']);
      },
      onError() {
        notification.error({
          key: 'delete-legacy-service-accounts',
          message: 'Legacy service account is not deleted!',
          description: 'An error occured while deleting legacy service accounts.',
        });
      },
    }
  );


  const handleDelete = () => {
    const serviceAccIds = accounts.map((account: ServiceAccount) => account.id)
    deleteLegacyServiceAccounts(serviceAccIds);
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

  if (!writeOk) {
    return <></>;
  }

  return (
    <StyledAlert
      message={
        <>
          <p>
            We are deprecating authentication via CDF service accounts and API
            keys in favor of OIDC. Below are the legacy service accounts that can be safely deleted as they are no longer useful.
          </p>
          {accounts?.length && accounts.map((account: ServiceAccount) => <><Button
            disabled={true}
            onClick={() => { }}
            type="ghost"
            style={{ marginTop: 6 }}
          >
            {account.name}
          </Button><br /></>)}
          <br />
          <StyledDisableButtonSection>
            <Button
              disabled={!writeOk}
              onClick={openModal}
              type="danger"
              style={{ marginTop: 12 }}
            >
              Delete Legacy Service Accounts
            </Button>
          </StyledDisableButtonSection>
          <Modal footer={null} onCancel={closeModal} visible={isModalVisible}>
            <StyledModalContent>
              <StyledModalWarningIcon size={20} type="WarningStroke" />
              Are you sure you want to delete the Legacy Service Accounts?
            </StyledModalContent>
            <StyledModalButtons>
              <StyledModalButton onClick={closeModal} type="tertiary">
                Cancel
              </StyledModalButton>
              <StyledModalButton
                disabled={
                  !writeOk || remainingTime > 0
                }
                onClick={handleDelete}
                type="danger"
              >
                Delete
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

export default LegacyServiceAccountsWarning;
