import * as React from 'react';

import { useTranslation } from '@access-management/common/i18n';

import CustomInfo from './CustomInfo';

export const AccessConfigurationWarning = () => {
  const { t } = useTranslation();
  return (
    <CustomInfo
      type="warning"
      alertTitle={t('warning')}
      alertMessage={t(
        'changing-access-settings-could-have-unintended-consequences'
      )}
      hideModal
    />
  );
};
