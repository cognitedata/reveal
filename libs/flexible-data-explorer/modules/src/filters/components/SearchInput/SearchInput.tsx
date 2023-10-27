import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Input } from '@cognite/cogs.js';

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
      data-testid="search-input"
      type="text"
      variant="noBorder"
      placeholder={t('FILTER_SEARCH_INPUT_PLACEHOLDER')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
