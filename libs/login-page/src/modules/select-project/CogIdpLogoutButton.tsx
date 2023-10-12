import { useTranslation } from 'react-i18next';

import { logout } from '@cognite/cdf-sdk-singleton';
import { Button } from '@cognite/cogs.js';

export default function CogIdpLogoutButton() {
  const { t } = useTranslation();

  return (
    <Button
      icon="Logout"
      iconPlacement="right"
      type="ghost-accent"
      onClick={() => logout()}
    >
      {t('sign-in-other-account')}
    </Button>
  );
}
