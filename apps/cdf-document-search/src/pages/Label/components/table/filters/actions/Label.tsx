import { Option, Select } from 'apps/cdf-document-search/src/components/Select';
import React from 'react';
import { useAggregatesQuery } from 'apps/cdf-document-search/src/services/query/aggregates/query';
import { FilterContainer } from '../elements';

interface Props {
  onChange(values: string[]): void;
}

export const LabelFilter: React.FC<Props> = ({ onChange }) => {
  const { data, isLoading } = useAggregatesQuery();

  const options = data?.labels.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  return (
    <FilterContainer>
      <Select<Option<string>, true>
        title="Label"
        icon="Tag"
        options={options}
        onChange={(selectedOptions) =>
          onChange(selectedOptions?.map((option) => option.value) ?? [])
        }
        isLoading={isLoading}
        isMulti
      />
    </FilterContainer>
  );
};
