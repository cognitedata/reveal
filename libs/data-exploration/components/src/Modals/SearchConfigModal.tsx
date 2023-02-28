import React from 'react';
import { BaseModal } from './BaseModal';
import { SAVE, SEARCH_CONFIG_SUBTITLE, SEARCH_CONFIG_TITLE } from './constants';
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
