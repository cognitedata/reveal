import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@cognite/cogs.js';
import {
  getSelectedIdpDetails,
  removeSelectedIdpDetails,
  useIdp,
  usePca,
  AADResponse,
} from '@cognite/login-utils';

import { useTranslation } from '../../common/i18n';

export default function AADLogoutButton() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { internalId } = getSelectedIdpDetails() ?? {};
  const { data: idp } = useIdp<AADResponse>(internalId);
  const pca = usePca(idp?.appConfiguration.clientId, idp?.authority);

  const handleLogout = () => {
    if (pca) {
      const activeAccount = pca.getActiveAccount();
      pca.logout({
        account: activeAccount || undefined,
        onRedirectNavigate: () => {
          // By returning false, we skip the redirect to microsoft logout page
          // because we don't want user to be actually logged out from the idp.
          // Instead, we want @azure/msal-browser do the clean-up on local
          // storage and session storage.
          return false;
        },
      });
      pca.setActiveAccount(null);
      removeSelectedIdpDetails();
      navigate('/');
    }
  };

  return (
    <Button
      icon="Login"
      iconPlacement="right"
      onClick={handleLogout}
      type="ghost-accent"
    >
      {t('sign-in-other-account')}
    </Button>
  );
}
