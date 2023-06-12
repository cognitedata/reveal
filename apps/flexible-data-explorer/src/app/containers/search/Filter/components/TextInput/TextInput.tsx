import * as React from 'react';

import { translationKeys } from '../../../../../common';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { InputControlProps } from '../../types';
import { Input } from '../Input';

export const DEFAULT_TEXT_INPUT_PLACEHOLDER = 'Enter value...';

export type TextInputProps = InputControlProps<'string'>;

export const TextInput: React.FC<TextInputProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <Input
      type="text"
      variant="default"
      placeholder={t(
        translationKeys.filterTextInputPlaceholder,
        'Enter value...'
      )}
      value={value}
      onChange={onChange}
    />
  );
};
