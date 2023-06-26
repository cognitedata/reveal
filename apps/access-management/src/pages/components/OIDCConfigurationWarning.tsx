import * as React from 'react';

import { useTranslation } from '@access-management/common/i18n';

import CustomInfo from './CustomInfo';

export const OIDCConfigurationWarning = () => {
  const { t } = useTranslation();
  return (
    <CustomInfo
      type="warning"
      alertTitle={t('warning')}
      alertMessage={t(
        'changing-oidc-settings-could-have-unintended-consequences'
      )}
      hideModal
    />
  );
};
