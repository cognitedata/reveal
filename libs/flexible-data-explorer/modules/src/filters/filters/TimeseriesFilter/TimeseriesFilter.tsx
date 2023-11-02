import { useMemo } from 'react';

import { useDebouncedState } from '@fdx/shared/hooks/useDebouncedState';
import { ValueByField } from '@fdx/shared/types/filters';

import { Timeseries } from '@cognite/sdk';

import { FilterBuilderByField } from '../../modules';

import { TIMESERIES_FIELDS } from './fields';
import { useTimeseriesMetadataFields } from './hooks';

export interface TimeseriesFilterProps {
  value?: ValueByField<Timeseries>;
  onChange: (value: ValueByField<Timeseries>) => void;
}

export const TimeseriesFilter: React.FC<TimeseriesFilterProps> = ({
  value,
  onChange,
}) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { data: metadataFields, isLoading } =
    useTimeseriesMetadataFields(query);

  const fields = useMemo(() => {
    return [...TIMESERIES_FIELDS, ...metadataFields];
  }, [metadataFields]);

  return (
    <FilterBuilderByField
      name="Timeseries"
      displayName="Time series"
      fields={fields}
      onSearchInputChange={setQuery}
      value={value}
      onChange={onChange}
      isLoading={isLoading}
    />
  );
};
