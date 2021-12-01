import { Select } from 'components/Select';
import React from 'react';
import { useAggregatesQuery } from 'services/query/aggregates/query';
import { FilterContainer } from '../elements';
import { FilterProps } from '../types';

export const SourceFilter: React.FC<FilterProps> = ({ onChange }) => {
  const { data, isLoading } = useAggregatesQuery();

  const sourceOptions = data?.source.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  return (
    <FilterContainer>
      <Select
        title="Source"
        icon="Datasource"
        filterKey="source"
        options={sourceOptions}
        onChange={onChange}
        isLoading={isLoading}
      />
    </FilterContainer>
  );
};
