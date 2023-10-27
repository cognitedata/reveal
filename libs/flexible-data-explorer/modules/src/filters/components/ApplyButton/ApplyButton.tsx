import * as React from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { MenuFooterButton } from '../MenuFooterButton';

export interface ApplyButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const ApplyButton: React.FC<ApplyButtonProps> = (props) => {
  const { t } = useTranslation();

  return <MenuFooterButton {...props} text={t('FILTER_APPLY_BUTTON')} />;
};
