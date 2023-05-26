import React from 'react';

import { Select } from '@data-exploration-components/components';
import {
  DATA_EXPLORATION_COMPONENT,
  useMetrics,
} from '@data-exploration-lib/core';
import { NIL_FILTER_VALUE } from '@data-exploration-lib/domain-layer';

import { OptionType } from '@cognite/cogs.js';

import { reactSelectCogsStylingProps } from '../elements';
import { FilterFacetTitle } from '../FilterFacetTitle';

export const AggregatedFilterV2 = <T,>({
  items,
  value,
  setValue,
  title,
  aggregator,
  addNilOption,
}: {
  items: T[];
  aggregator: string;
  value: string | undefined;
  title: string;
  setValue: (newValue: string | undefined) => void;
  addNilOption?: boolean;
}) => {
  const setSource = (newValue: string | undefined) => {
    const newSource = newValue && newValue.length > 0 ? newValue : undefined;
    setValue(newSource);
  };
  const trackUsage = useMetrics();

  const sources: Set<string | number> = new Set();
  items.forEach((el) => {
    if (aggregator in el) {
      sources.add((el as any)[aggregator] as string | number);
    }
  });

  const handleOnChange = (item: OptionType<string | number>) => {
    if (item) {
      const tmpValue = (item as { value: string }).value;
      setSource(tmpValue);
    } else {
      setSource(undefined);
    }
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_FILTER, {
      value: item?.value,
      title,
    });
  };

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <Select
        creatable
        className="aggregated-filter-select"
        {...reactSelectCogsStylingProps}
        value={
          value
            ? { value, label: value === NIL_FILTER_VALUE ? 'N/A' : value }
            : undefined
        }
        onChange={handleOnChange}
        options={[...sources].map((el) => ({
          value: el,
          label: String(el),
        }))}
        addNilOption={addNilOption}
        closeMenuOnSelect={false}
      />
    </>
  );
};
