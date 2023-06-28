import React from 'react';

import {
  SAVE,
  SEARCH_CONFIG_SUBTITLE,
  SEARCH_CONFIG_TITLE,
  useTranslation,
} from '@data-exploration-lib/core';

import { BaseModal } from './BaseModal';
import { BaseModalProps } from './type';

type SearchConfigModalProps = Omit<BaseModalProps, 'size'>;

export const SearchConfigModal: React.FC<SearchConfigModalProps> = ({
  title,
  okText,
  subtitle,
  children,
  ...props
}: SearchConfigModalProps) => {
  const { t } = useTranslation();
  return (
    <BaseModal
      title={title || t('SEARCH_PARAMETERS', SEARCH_CONFIG_TITLE)}
      subtitle={subtitle || t('SEARCH_CONFIG_SUBTITLE', SEARCH_CONFIG_SUBTITLE)}
      okText={okText || t('SAVE', SAVE)}
      size="large"
      chip="Configure"
      cancelText={t('CANCEL', 'Cancel')}
      {...props}
    >
      {children}
    </BaseModal>
  );
};
