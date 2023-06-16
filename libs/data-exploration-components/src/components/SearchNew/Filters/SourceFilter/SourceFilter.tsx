import * as React from 'react';

import { AggregatedFilterV2 } from '@data-exploration/containers';
import head from 'lodash/head';

import { extractSources, MultiSelectFilter } from '@cognite/data-exploration';

import { OptionValue } from '../types';

export interface SourceFilterProps<T extends { source?: string }> {
  items: T[];
  value?: OptionValue<string>[];
  onChange: (newSources: OptionValue<string>[]) => void;
  addNilOption?: boolean;
  isAdvancedFiltersEnabled?: boolean;
}

export const SourceFilter = <T extends { source?: string }>({
  items,
  isAdvancedFiltersEnabled,
  onChange,
  ...rest
}: SourceFilterProps<T>) => {
  const options = React.useMemo(() => {
    return extractSources(items).map((option) => ({
      label: option,
      value: option,
    }));
  }, [items]);

  /**
   * Remove this and `isAdvancedFiltersEnabled` prop
   * after fully migrated to new filter.
   */
  if (!isAdvancedFiltersEnabled) {
    return (
      <AggregatedFilterV2
        addNilOption
        {...rest}
        title="Source"
        aggregator="source"
        items={items}
        value={head(rest.value)?.value}
        setValue={(newSource) =>
          onChange([
            {
              label: newSource,
              value: String(newSource),
            },
          ])
        }
      />
    );
  }

  return (
    <MultiSelectFilter<string>
      addNilOption
      {...rest}
      title="Source"
      options={options}
      onChange={(_, newSources) => onChange(newSources)}
    />
  );
};
