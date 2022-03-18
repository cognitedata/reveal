import React from 'react';
import styled from 'styled-components';
import CustomAlert from 'pages/common/CustomAlert';

import { ServiceAccount } from '@cognite/sdk';
import { getProject } from '@cognite/cdf-utilities';
import { usePermissions, useDeleteServiceAccounts } from 'hooks';
import { Title, Icon } from '@cognite/cogs.js';

const StyledList = styled.ul`
  margin-bottom: 0 !important;
  margin-top: 2px;
`;

const StyledListItem = styled.li`
  margin-top: 3;
`;

const LegacyServiceAccountsWarning = (props: {
  accounts: ServiceAccount[];
}) => {
  const { accounts } = props;
  const { data: writeOk } = usePermissions('projectsAcl', 'UPDATE');

  const project = getProject();
  const { mutate: deleteLegacyServiceAccounts } =
    useDeleteServiceAccounts(project);

  const handleSubmit = () => {
    const serviceAccIds = accounts.map((account: ServiceAccount) => account.id);
    deleteLegacyServiceAccounts(serviceAccIds);
  };

  if (!writeOk) {
    return <></>;
  }

  return (
    <CustomAlert
      type="info"
      alertMessage={
        <>
          <Title level={5} style={{ display: 'flex', marginTop: 4 }}>
            <Icon
              type="InfoFilled"
              style={{ color: 'blue', marginRight: 4, marginTop: 2 }}
            />
            Clean up service account
          </Title>
          <p style={{ margin: '12px 0 0 20px' }}>
            This project no longer support service accounts. You have{' '}
            {accounts.length} service accounts that be removed as they are no
            longer supported with OIDC and can be safely reomoved.
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
          ) : (
            <br />
          )}
        </>
      }
      alertBtnLabel="Delete service accounts"
      alertBtnDisabled={!writeOk}
      helpEnabled={false}
      confirmMessage={
        <>
          <p>Are you sure you want to delete these service account(s)?</p>
        </>
      }
      confirmLabel="Delete"
      onClickConfirm={handleSubmit}
    />
  );
};

export default LegacyServiceAccountsWarning;
