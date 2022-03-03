import { Option, Select } from 'components/Select';
import React from 'react';
import { useAggregatesQuery } from 'services/query/aggregates/query';
import { FilterContainer } from '../elements';

interface Props {
  onChange(values: string[]): void;
}

export const DocumentCategoryFilter: React.FC<Props> = ({ onChange }) => {
  const { data, isLoading } = useAggregatesQuery();

  const documentTypeOptions = data?.documentType.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  return (
    <FilterContainer>
      <Select<Option<string>, true>
        title="Document Type"
        icon="Tag"
        options={documentTypeOptions}
        onChange={(options) =>
          onChange(options?.map((option) => option.value) ?? [])
        }
        isLoading={isLoading}
        isMulti
      />
    </FilterContainer>
  );
};
