import React from 'react';

import { BaseModal } from './BaseModal';
import { BaseModalProps } from './type';

type BreakJourneyModalProps = Omit<BaseModalProps, 'size'>;

const TITLE = 'Viewing Options';

export const BreakJourneyModal: React.FC<BreakJourneyModalProps> = ({
  title = TITLE,
  children,
  ...props
}: BreakJourneyModalProps) => {
  return (
    <BaseModal title={title} size="medium" {...props}>
      {children}
    </BaseModal>
  );
};
