import {
  DATA_EXPLORATION_COMPONENT,
  useDebouncedMetrics,
} from '@data-exploration-lib/core';
import { StringInput, StringInputProps } from '@data-exploration/components';

export const ExternalIdFilter = ({ onChange, ...rest }: StringInputProps) => {
  const trackUsage = useDebouncedMetrics();
  const handleChange = (value?: string) => {
    onChange?.(value);
    trackUsage(DATA_EXPLORATION_COMPONENT.INPUT.TEXT_FILTER, {
      value,
      title: 'External ID',
    });
  };

  return <StringInput label="External ID" onChange={handleChange} {...rest} />;
};
