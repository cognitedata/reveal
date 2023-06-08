import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@access-management/common/i18n';
import CustomInfo from '@access-management/pages/components/CustomInfo';
import {
  usePermissions,
  useDeleteServiceAccounts,
} from '@access-management/hooks';

import { getProject } from '@cognite/cdf-utilities';
import { ServiceAccount } from '@cognite/sdk';

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
                  {t('count-view-more', { count: accounts.length - 2 })}
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
