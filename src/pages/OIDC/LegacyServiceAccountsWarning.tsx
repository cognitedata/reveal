import React from 'react';
import styled from 'styled-components';
import CustomAlert from 'pages/common/CustomAlert';

import { ServiceAccount } from '@cognite/sdk';
import { getProject } from '@cognite/cdf-utilities';
import { usePermissions, useDeleteServiceAccounts } from 'hooks';

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
      type="error"
      alertMessage={
        <>
          <p>
            Signing in with legacy login is disabled for this project, and the
            service accounts listed below are no longer applicable.
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
        </>
      }
      alertBtnLabel="Delete service accounts"
      alertBtnDisabled={!writeOk}
      helpEnabled={false}
      confirmMessage="Are you sure you want to delete these service accounts?"
      confirmLabel="Delete"
      onClickConfirm={handleSubmit}
    />
  );
};

export default LegacyServiceAccountsWarning;
