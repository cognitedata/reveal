import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@cognite/cogs.js';
import {
  getSelectedIdpDetails,
  removeSelectedIdpDetails,
  useIdp,
  useCogniteIdPUserManager,
  CogniteIdPResponse,
  getBaseUrl,
} from '@cognite/login-utils';

export default function CogIdpLogoutButton() {
  const { t } = useTranslation();
  const { internalId } = getSelectedIdpDetails() ?? {};
  const { data: idp, isFetched } = useIdp<CogniteIdPResponse>(internalId);

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
        const redirectUri = getBaseUrl();
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
