import * as React from 'react';
import CustomInfo from './CustomInfo';
import { useTranslation } from 'common/i18n';

export const UserProfilesConfigurationWarning = () => {
  const { t } = useTranslation();
  return (
    <CustomInfo
      type="info"
      alertTitle={t('info')}
      alertMessage={t(
        'enabling-user-profiles-collects-data-for-all-active-users'
      )}
      hideModal
    />
  );
};
