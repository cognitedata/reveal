import { BooleanInput, BooleanInputProps } from '@data-exploration/components';

import {
  DATA_EXPLORATION_COMPONENT,
  useMetrics,
} from '@data-exploration-lib/core';

export const IsStringFilter = (props: BooleanInputProps) => {
  const { onChange } = props;
  const trackUsage = useMetrics();
  const handleChange = (value?: boolean) => {
    onChange?.(value);
    trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.BOOLEAN_FILTER, {
      value,
      title: 'Is String',
    });
  };

  return <BooleanInput label="Is String" onChange={handleChange} {...props} />;
};
