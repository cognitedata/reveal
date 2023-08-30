import React from 'react';

import { Button } from '@cognite/cogs.js';
import {
  getSelectedIdpDetails,
  removeSelectedIdpDetails,
  useIdp,
  AADResponse,
} from '@cognite/login-utils';

import { useTranslation } from '../../common/i18n';

export default function ADFSLogoutButton() {
  const { internalId } = getSelectedIdpDetails() ?? {};
  const { data: idp } = useIdp<AADResponse>(internalId);
  const { t } = useTranslation();

  return (
    <Button
      disabled={!idp?.authority}
      onClick={() => {
        removeSelectedIdpDetails();
        sessionStorage.clear();
        window.location.href = idp?.authority + '/logout';
      }}
    >
      {t('sign-out')}
    </Button>
  );
}
