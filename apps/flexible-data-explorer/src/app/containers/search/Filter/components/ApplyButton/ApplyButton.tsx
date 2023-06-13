import * as React from 'react';

import { translationKeys } from '../../../../../common';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { MenuFooterButton } from '../MenuFooterButton';

export interface ApplyButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const ApplyButton: React.FC<ApplyButtonProps> = (props) => {
  const { t } = useTranslation();

  return (
    <MenuFooterButton
      {...props}
      text={t(translationKeys.filterButtonApply, 'Apply')}
    />
  );
};
