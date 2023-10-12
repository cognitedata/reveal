import * as React from 'react';

import { AggregatedFilterV2 } from '@data-exploration/containers';
import head from 'lodash/head';

import { useTranslation } from '@data-exploration-lib/core';

import { extractSources } from '../../../../utils';
import { MultiSelectFilter } from '../../../MultiSelectFilter';
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
  const { t } = useTranslation();

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
        title={t('SOURCE', 'Source')}
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
      title={t('SOURCES', 'Sources')}
      options={options}
      onChange={(_, newSources) => onChange(newSources)}
    />
  );
};
