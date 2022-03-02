import { Option, Select } from 'components/Select';
import React from 'react';
import { useAggregatesQuery } from 'services/query/aggregates/query';
import { FilterContainer } from '../elements';

interface Props {
  onChange(value: string | undefined): void;
}

export const DocumentCategoryFilter: React.FC<Props> = ({ onChange }) => {
  const { data, isLoading } = useAggregatesQuery();

  const documentTypeOptions = data?.documentType.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  return (
    <FilterContainer>
      <Select<Option<string>>
        title="Document Type"
        icon="Tag"
        options={documentTypeOptions}
        onChange={(option) => onChange(option?.value)}
        isLoading={isLoading}
      />
    </FilterContainer>
  );
};
