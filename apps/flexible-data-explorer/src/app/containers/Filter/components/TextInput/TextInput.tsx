import * as React from 'react';

import { useTranslation } from '../../../../hooks/useTranslation';
import { BaseInputProps } from '../../types';
import { Input } from '../Input';

export type TextInputProps = BaseInputProps<string>;

export const TextInput: React.FC<TextInputProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Input
      {...props}
      type="text"
      variant="default"
      placeholder={t('FILTER_TEXT_INPUT_PLACEHOLDER')}
    />
  );
};
