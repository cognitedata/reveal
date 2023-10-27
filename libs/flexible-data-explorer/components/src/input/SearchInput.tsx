import { useCallback, useState } from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Button, Input } from '@cognite/cogs.js';

interface Props {
  query?: string;
  onChange?: (query: string) => void;
}
export const SearchInput: React.FC<Props> = ({ query, onChange }) => {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);

  const handleClearClick = useCallback(() => {
    setFocused(false);
    onChange?.('');
  }, [onChange]);

  if (!focused) {
    return (
      <Button type="tertiary" onClick={() => setFocused(true)} icon="Search" />
    );
  }

  return (
    <Input
      placeholder={t('SEARCH_PLACEHOLDER')}
      clearable={{ callback: handleClearClick }}
      value={query || undefined}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
};
