import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Button } from '@cognite/cogs.js';

export const ButtonOpenIn = ({ loading }: { loading?: boolean }) => {
  const { t } = useTranslation();

  return (
    <Button
      icon="ChevronDown"
      iconPlacement="right"
      type="tertiary"
      disabled={loading}
    >
      {t('GENERAL_OPEN_IN')}...
    </Button>
  );
};
