import * as React from 'react';

import { translationKeys } from '../../../../../common';
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
      placeholder={t(
        translationKeys.filterSearchInputPlaceholder,
        'Filter by name...'
      )}
      value={value}
      onChange={onChange}
    />
  );
};
