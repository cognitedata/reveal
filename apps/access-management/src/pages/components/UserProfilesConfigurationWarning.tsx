import * as React from 'react';

import { useTranslation } from '@access-management/common/i18n';

import CustomInfo from './CustomInfo';

export const UserProfilesConfigurationWarning = () => {
  const { t } = useTranslation();
  return (
    <CustomInfo
      type="neutral"
      alertTitle={t('info')}
      alertMessage={t(
        'enabling-user-profiles-collects-data-for-all-active-users'
      )}
      hideModal
    />
  );
};
