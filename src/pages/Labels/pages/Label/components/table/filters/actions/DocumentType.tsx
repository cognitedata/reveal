import { Select } from 'components/Select';
import React from 'react';
import { useAggregatesQuery } from 'services/query/aggregates/query';
import { FilterContainer } from '../elements';
import { FilterProps } from '../types';

export const DocumentCategoryFilter: React.FC<FilterProps> = ({ onChange }) => {
  const { data, isLoading } = useAggregatesQuery();

  const documentTypeOptions = data?.documentType.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  return (
    <FilterContainer>
      <Select
        title="Document Type"
        icon="Tag"
        filterKey="documentType"
        options={documentTypeOptions}
        onChange={onChange}
        isLoading={isLoading}
      />
    </FilterContainer>
  );
};
