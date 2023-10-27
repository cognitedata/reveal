import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Button } from '@cognite/cogs.js';

export const ButtonShowMore = ({
  onClick,
  hidden,
}: {
  onClick?: () => void;
  hidden?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Button onClick={onClick} type="secondary" hidden={hidden}>
      {t('GENERAL_SHOW_MORE')}
    </Button>
  );
};
