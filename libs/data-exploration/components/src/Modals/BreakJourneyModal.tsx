import React from 'react';

import { useTranslation } from '@data-exploration-lib/core';

import { BaseModal } from './BaseModal';
import { BaseModalProps } from './type';

type BreakJourneyModalProps = Omit<BaseModalProps, 'size'>;

export const BreakJourneyModal: React.FC<BreakJourneyModalProps> = ({
  title,
  children,
  ...props
}: BreakJourneyModalProps) => {
  const { t } = useTranslation();

  return (
    <BaseModal
      title={title || t('VIEWING_OPTIONS', 'Viewing Options')}
      size="medium"
      {...props}
    >
      {children}
    </BaseModal>
  );
};
