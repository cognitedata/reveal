import React from 'react';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';
import { notification } from 'antd';
import CustomAlert from 'pages/common/CustomAlert';

import { ServiceAccount } from '@cognite/sdk';
import { getProject } from '@cognite/cdf-utilities';
import { usePermissions, useDeleteServiceAccounts } from 'hooks';

const StyledList = styled.ul`
  margin-top: 6;
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

  const handleSubmit = () => {
    const serviceAccIds = accounts.map((account: ServiceAccount) => account.id);
    deleteLegacyServiceAccounts(serviceAccIds);
  };

  if (!writeOk) {
    return <></>;
  }

  return (
    <CustomAlert
      type="error"
      alertMessage={
        <>
          <p>
            Legacy login is deprecated for this project and it still has some
            service accounts. The service accounts listed below can be deleted
            as they do not work with OpenID Connect :
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
        </>
      }
      alertBtnLabel="Delete Legacy Service Accounts"
      alertBtnDisabled={!writeOk}
      helpEnabled={false}
      confirmMessage="Are you sure you want to delete the Legacy Service Accounts?"
      onClickConfirm={handleSubmit}
    />
  );
};

export default LegacyServiceAccountsWarning;
