import * as React from 'react';
import CustomInfo from './CustomInfo';
import { useTranslation } from 'common/i18n';

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
