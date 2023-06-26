import { StringInput, StringInputProps } from '@data-exploration/components';

import {
  DATA_EXPLORATION_COMPONENT,
  useDebouncedMetrics,
  useTranslation,
} from '@data-exploration-lib/core';

export const ExternalIdFilter = ({ onChange, ...rest }: StringInputProps) => {
  const { t } = useTranslation();

  const trackUsage = useDebouncedMetrics();
  const handleChange = (value?: string) => {
    onChange?.(value);
    trackUsage(DATA_EXPLORATION_COMPONENT.INPUT.TEXT_FILTER, {
      value,
      title: 'External ID',
    });
  };

  return (
    <StringInput
      label={t('EXTERNAL_ID', 'External ID')}
      onChange={handleChange}
      {...rest}
    />
  );
};
