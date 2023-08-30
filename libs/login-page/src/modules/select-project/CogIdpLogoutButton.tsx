import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@cognite/cogs.js';
import {
  getSelectedIdpDetails,
  removeSelectedIdpDetails,
  useIdp,
  KeycloakResponse,
  useCogniteIdPUserManager,
} from '@cognite/login-utils';

export default function CogIdpLogoutButton() {
  const { t } = useTranslation();
  const { internalId } = getSelectedIdpDetails() ?? {};
  const { data: idp, isFetched } = useIdp<KeycloakResponse>(internalId);

  const userManager = useCogniteIdPUserManager({
    authority: idp?.authority || '',
    client_id: idp?.appConfiguration.clientId || '',
  });

  return (
    <Button
      icon="Login"
      iconPlacement="right"
      type="ghost-accent"
      onClick={() => {
        removeSelectedIdpDetails();
        const redirectUri = `https://${window.location.hostname
          .split('.')
          .slice(1)
          .join('.')}`;
        userManager.signoutRedirect({
          post_logout_redirect_uri: redirectUri,
        });
      }}
      disabled={!isFetched}
    >
      {t('sign-in-other-account')}
    </Button>
  );
}
