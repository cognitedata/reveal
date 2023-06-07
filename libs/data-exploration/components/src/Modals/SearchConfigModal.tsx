import React from 'react';

import {
  SAVE,
  SEARCH_CONFIG_SUBTITLE,
  SEARCH_CONFIG_TITLE,
} from '@data-exploration-lib/core';

import { BaseModal } from './BaseModal';
import { BaseModalProps } from './type';

type SearchConfigModalProps = Omit<BaseModalProps, 'size'>;

export const SearchConfigModal: React.FC<SearchConfigModalProps> = ({
  title = SEARCH_CONFIG_TITLE,
  okText = SAVE,
  subtitle = SEARCH_CONFIG_SUBTITLE,
  children,
  ...props
}: SearchConfigModalProps) => {
  return (
    <BaseModal
      title={title}
      subtitle={subtitle}
      okText={okText}
      size="large"
      chip="Configure"
      {...props}
    >
      {children}
    </BaseModal>
  );
};
