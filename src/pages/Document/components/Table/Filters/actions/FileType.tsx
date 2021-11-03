import { Select } from 'components/Select';
import React from 'react';
import { useAggregatesQuery } from 'services/query/aggregates/query';
import { FilterContainer } from '../elements';
import { FilterProps } from '../types';

export const FileTypeFilter: React.FC<FilterProps> = ({ onChange }) => {
  const { data, isLoading } = useAggregatesQuery();

  const fileTypeOptions = data?.fileType.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  return (
    <FilterContainer>
      <Select
        title="File Type"
        icon="ResourceDocuments"
        filterKey="fileType"
        options={fileTypeOptions}
        onChange={onChange}
        isLoading={isLoading}
      />
    </FilterContainer>
  );
};
