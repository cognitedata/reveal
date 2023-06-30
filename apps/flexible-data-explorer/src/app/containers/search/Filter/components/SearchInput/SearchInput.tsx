import * as React from 'react';

import { useTranslation } from '../../../../../hooks/useTranslation';
import { Input } from '../Input';

export interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <Input
      type="text"
      variant="noBorder"
      placeholder={t('FILTER_SEARCH_INPUT_PLACEHOLDER')}
      value={value}
      onChange={onChange}
    />
  );
};
