import * as React from 'react';
import CustomInfo from './CustomInfo';
import { useTranslation } from 'react-i18next';

export const OIDCConfigurationWarning = () => {
  const { t } = useTranslation();
  return (
    <CustomInfo
      type="warning"
      alertTitle={t('warning')}
      alertMessage={t(
        'chaging-oidc-settings-could-have-unintended-consequences'
      )}
      hideModal
    />
  );
};
