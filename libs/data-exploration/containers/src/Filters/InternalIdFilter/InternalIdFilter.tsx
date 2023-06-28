import { NumberInput, NumberInputProps } from '@data-exploration/components';

import {
  DATA_EXPLORATION_COMPONENT,
  useDebouncedMetrics,
  useTranslation,
} from '@data-exploration-lib/core';

export const InternalIdFilter = (props: NumberInputProps) => {
  const { onChange } = props;

  const { t } = useTranslation();
  const trackUsage = useDebouncedMetrics();

  const handleChange = (value?: number) => {
    onChange?.(value);
    trackUsage(DATA_EXPLORATION_COMPONENT.INPUT.NUMBER_FILTER, {
      value,
      title: 'Internal ID',
    });
  };

  return (
    <NumberInput
      label={t('INTERNAL_ID', 'Internal ID')}
      onChange={handleChange}
      {...props}
    />
  );
};
