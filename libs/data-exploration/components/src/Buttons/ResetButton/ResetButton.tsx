import { Button } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { RESET } from './constants';

interface Props {
  onClick?: () => void;
}
export const ResetButton: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return <Button {...props}>{t('RESET', RESET)}</Button>;
};
