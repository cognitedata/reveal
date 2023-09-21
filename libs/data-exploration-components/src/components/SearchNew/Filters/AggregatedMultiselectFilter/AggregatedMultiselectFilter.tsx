import React from 'react';

import {
  DATA_EXPLORATION_COMPONENT,
  useMetrics,
} from '@data-exploration-lib/core';
import { mapAggregateDataToSourceData } from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../../../MultiSelectFilter';

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
      options={sourceArray}
      value={value}
      onChange={handleOnChange}
      addNilOption={addNilOption}
    />
  );
};
