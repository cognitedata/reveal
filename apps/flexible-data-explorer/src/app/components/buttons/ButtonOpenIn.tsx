import { Button } from '@cognite/cogs.js';

import { translationKeys } from '../../common/i18n/translationKeys';
import { useTranslation } from '../../hooks/useTranslation';

export const ButtonOpenIn = ({ loading }: { loading?: boolean }) => {
  const { t } = useTranslation();

  return (
    <Button
      icon="ChevronDown"
      iconPlacement="right"
      type="tertiary"
      disabled={loading}
    >
      {t(translationKeys.openInButton, 'Open in...')}
    </Button>
  );
};
