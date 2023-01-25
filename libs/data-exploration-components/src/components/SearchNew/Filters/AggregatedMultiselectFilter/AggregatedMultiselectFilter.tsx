import React from 'react';
import { MultiSelectFilter } from '@data-exploration-components/components';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';
import { mapAggregateDataToSourceData } from '@data-exploration-lib/domain-layer';

export const AggregatedMultiselectFilter = <T extends {}>({
  items,
  value,
  setValue,
  title,
  aggregator,
  addNilOption,
}: {
  items: T[];
  aggregator: string;
  title: string;
  value?: string[];
  setValue: (newValue?: string[]) => void;
  addNilOption?: boolean;
}) => {
  const trackUsage = useMetrics();

  const sourceArray = React.useMemo(
    () => mapAggregateDataToSourceData(items, aggregator),
    [items, aggregator]
  );

  const selectedValues = value?.map((el) => ({
    label: el,
    value: el,
  }));

  const handleOnChange = (item: string[]) => {
    if (item) {
      setValue(item);
    }
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_FILTER, {
      value: item,
      title,
    });
  };

  return (
    <MultiSelectFilter
      title={title}
      creatable
      options={sourceArray}
      value={selectedValues}
      onChange={handleOnChange}
      addNilOption={addNilOption}
    />
  );
};
