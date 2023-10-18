import { NumberInput, NumberInputProps } from '@data-exploration/components';
import noop from 'lodash/noop';

import {
  DATA_EXPLORATION_COMPONENT,
  useDebouncedMetrics,
  useDebouncedQuery,
  useTranslation,
} from '@data-exploration-lib/core';

export const InternalIdFilter = (props: NumberInputProps) => {
  const { onChange = noop, value } = props;

  const { t } = useTranslation();
  const trackUsage = useDebouncedMetrics();
  const [localQuery, setLocalQuery] = useDebouncedQuery<number>(
    onChange,
    value
  );

  const handleChange = (newValue?: number) => {
    setLocalQuery(newValue);
    trackUsage(DATA_EXPLORATION_COMPONENT.INPUT.NUMBER_FILTER, {
      value: newValue,
      title: 'Internal ID',
    });
  };

  return (
    <NumberInput
      label={t('INTERNAL_ID', 'Internal ID')}
      onChange={handleChange}
      value={localQuery}
      {...props}
    />
  );
};
