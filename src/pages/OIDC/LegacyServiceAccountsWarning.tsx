import React, { useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Alert as AntdAlert, Modal, notification } from 'antd';

import { Button, Colors, Icon } from '@cognite/cogs.js';
import { ServiceAccount } from '@cognite/sdk';
import { getProject } from '@cognite/cdf-utilities';

import { usePermissions, useDeleteServiceAccounts } from 'hooks';
import { NUMBER_OF_SECONDS_TO_ALLOW_DISABLING } from '../../utils/constants';

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

const StyledList = styled.ul`
  margin-bottom: 0 !important;
  color: rgba(0, 0, 0, 0.65);
`;

const StyledListItem = styled.li`
  margin-top: 3;
`;

const LegacyServiceAccountsWarning = (props: {
  accounts: ServiceAccount[];
}) => {
  const { accounts } = props;
  const client = useQueryClient();
  const { data: writeOk } = usePermissions('projectsAcl', 'UPDATE');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(
    NUMBER_OF_SECONDS_TO_ALLOW_DISABLING
  );
  const timerRef = useRef<NodeJS.Timeout>();

  const project = getProject();
  const { mutate: deleteLegacyServiceAccounts } = useDeleteServiceAccounts(
    project,
    {
      onMutate() {
        notification.info({
          key: 'delete-legacy-service-accounts',
          message: 'Deleting Legacy Service Accounts',
        });
      },
      onSuccess() {
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
          description:
            'An error occured while deleting legacy service accounts.',
        });
      },
    }
  );

  const handleDelete = () => {
    const serviceAccIds = accounts.map((account: ServiceAccount) => account.id);
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
            Legacy login is deprecated for this project and it still has some
            service accounts. The service accounts listed below can be deleted
            as they do not work with OIDC :
          </p>
          <StyledList>
            {accounts
              .slice(0, 10)
              .map((account: ServiceAccount, index) =>
                index < 10 ? (
                  <StyledListItem>{account.name}</StyledListItem>
                ) : null
              )}
          </StyledList>
          {accounts.length > 10 ? (
            <p style={{ marginLeft: 28, color: 'rgba(0, 0, 0, 0.65)' }}>
              +{accounts.length - 10} more
            </p>
          ) : null}
          {accounts.length <= 10 && <br />}
          <StyledDisableButtonSection>
            <Button disabled={!writeOk} onClick={openModal} type="danger">
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
                disabled={!writeOk || remainingTime > 0}
                onClick={() => {
                  handleDelete();
                }}
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
