import React from 'react';
import styled from 'styled-components';
import CustomInfo from 'pages/components/CustomInfo';
import { ServiceAccount } from '@cognite/sdk';
import { getProject } from '@cognite/cdf-utilities';
import { usePermissions, useDeleteServiceAccounts } from 'hooks';

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
    <CustomInfo
      type="neutral"
      alertTitle="Clean up service account"
      alertMessage={
        <>
          <p>
            This project no longer support service accounts. You have{' '}
            {accounts.length} service accounts that be removed as they are no
            longer supported with OIDC and can be safely reomoved.
          </p>
          {accounts.length <= 3 ? (
            <StyledList>
              {accounts.map((account: ServiceAccount) => (
                <StyledListItem key={account.name}>
                  {account.name}
                </StyledListItem>
              ))}
            </StyledList>
          ) : (
            <>
              <StyledList>
                {accounts.slice(0, 2).map((account: ServiceAccount) => (
                  <StyledListItem key={account.name}>
                    {account.name}
                  </StyledListItem>
                ))}
                <StyledListItem>{`+${
                  accounts.length - 2
                } more`}</StyledListItem>
              </StyledList>
            </>
          )}
        </>
      }
      alertBtnLabel={'Delete service accounts'}
      alertBtnDisabled={!writeOk}
      helpEnabled={false}
      confirmTitle={'Delete service accounts'}
      confirmMessage={'delete service accounts'}
      onClickConfirm={handleSubmit}
    />
  );
};

const StyledList = styled.ul`
  margin-top: 2px;
  padding-left: 16px !important;
`;

const StyledListItem = styled.li`
  margin-top: 3;
`;

export default LegacyServiceAccountsWarning;
