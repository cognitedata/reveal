import * as React from 'react';

import { useTranslation } from '../../../../../hooks/useTranslation';
import { InputControlProps } from '../../types';
import { Input } from '../Input';

export type TextInputProps = InputControlProps<string>;

export const TextInput: React.FC<TextInputProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <Input
      type="text"
      variant="default"
      placeholder={t('FILTER_TEXT_INPUT_PLACEHOLDER')}
      value={value}
      onChange={onChange}
    />
  );
};
