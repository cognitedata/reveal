import { BooleanInput, BooleanInputProps } from '@data-exploration/components';

import {
  DATA_EXPLORATION_COMPONENT,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';

export const IsStringFilter = (props: BooleanInputProps) => {
  const { onChange } = props;

  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const handleChange = (value?: boolean) => {
    onChange?.(value);
    trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.BOOLEAN_FILTER, {
      value,
      title: 'Is String',
    });
  };

  return (
    <BooleanInput
      label={t('IS_STRING', 'Is String')}
      onChange={handleChange}
      {...props}
    />
  );
};
