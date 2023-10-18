import { StringInput, StringInputProps } from '@data-exploration/components';
import noop from 'lodash/noop';

import {
  DATA_EXPLORATION_COMPONENT,
  useDebouncedMetrics,
  useDebouncedQuery,
  useTranslation,
} from '@data-exploration-lib/core';

export const ExternalIdFilter = ({
  onChange = noop,
  value,
  ...rest
}: StringInputProps) => {
  const { t } = useTranslation();
  const [localQuery, setLocalQuery] = useDebouncedQuery<string>(
    onChange,
    value
  );

  const trackUsage = useDebouncedMetrics();
  const handleChange = (newValue?: string) => {
    setLocalQuery(newValue);
    trackUsage(DATA_EXPLORATION_COMPONENT.INPUT.TEXT_FILTER, {
      value: newValue,
      title: 'External ID',
    });
  };

  return (
    <StringInput
      label={t('EXTERNAL_ID', 'External ID')}
      onChange={handleChange}
      value={localQuery}
      {...rest}
    />
  );
};
