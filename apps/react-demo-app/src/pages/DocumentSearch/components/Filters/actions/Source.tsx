import { Option, Select } from 'src/components/Select';
import React from 'react';
import { useAggregatesQuery } from 'src/services/query/aggregates/query';

import { FilterContainer } from '../elements';

interface Props {
  onChange(values: string[]): void;
}

export const SourceFilter: React.FC<Props> = ({ onChange }) => {
  const { data, isLoading } = useAggregatesQuery();

  const sourceOptions: Option<string>[] = (data?.source ?? []).map((item) => ({
    value: item.name,
    label: item.name,
  }));

  return (
    <FilterContainer>
      <Select<Option<string>, true>
        title="Source"
        icon="DataSource"
        options={sourceOptions}
        onChange={(options) =>
          onChange(options?.map((option) => option.value) ?? [])
        }
        isLoading={isLoading}
        isMulti
      />
    </FilterContainer>
  );
};
