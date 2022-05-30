import React from 'react';
import styled from 'styled-components';
import CustomInfo from 'pages/components/CustomInfo';
import { ServiceAccount } from '@cognite/sdk';
import { getProject } from '@cognite/cdf-utilities';
import { usePermissions, useDeleteServiceAccounts } from 'hooks';
import { useTranslation } from 'common/i18n';

const LegacyServiceAccountsWarning = (props: {
  accounts: ServiceAccount[];
}) => {
  const { t } = useTranslation();
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
      alertTitle={t('legacy-service-account-cleanup')}
      alertMessage={
        <>
          <p>
            {t('legacy-service-account-cleanup-info', {
              accounts: accounts.length,
            })}
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
                <StyledListItem>
                  {t('text-view-more', { count: accounts.length - 2 })}
                </StyledListItem>
              </StyledList>
            </>
          )}
        </>
      }
      alertBtnLabel={t('legacy-service-account-delete')}
      alertBtnDisabled={!writeOk}
      helpEnabled={false}
      confirmTitle={t('legacy-service-account-delete')}
      confirmMessage={t('legacy-service-account-delete').toLocaleLowerCase()}
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
