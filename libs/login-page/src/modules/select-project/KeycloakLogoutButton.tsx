import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@cognite/cogs.js';
import {
  getSelectedIdpDetails,
  removeSelectedIdpDetails,
  useIdp,
  KeycloakResponse,
  useKeycloakUserManager,
} from '@cognite/login-utils';

export default function KeycloakLogoutButton() {
  const { t } = useTranslation();
  const { internalId } = getSelectedIdpDetails() ?? {};
  const { data: idp, isFetched } = useIdp<KeycloakResponse>(internalId);

  const userManager = useKeycloakUserManager({
    authority: idp?.authority || '',
    client_id: idp?.appConfiguration.clientId || '',
    cluster: idp?.clusters[0] || '',
    realm: idp?.realm || '',
    audience: idp?.appConfiguration.audience || '',
  });

  return (
    <Button
      icon="Login"
      iconPlacement="right"
      type="ghost-accent"
      onClick={() => {
        removeSelectedIdpDetails();
        userManager.signoutRedirect({
          post_logout_redirect_uri: window.location.href,
        });
      }}
      disabled={!isFetched}
    >
      {t('sign-in-other-account')}
    </Button>
  );
}
