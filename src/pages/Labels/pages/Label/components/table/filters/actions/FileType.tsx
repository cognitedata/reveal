import { Option, Select } from 'components/Select';
import React from 'react';
import { useAggregatesQuery } from 'services/query/aggregates/query';
import { FilterContainer } from '../elements';

interface Props {
  onChange(value: string | undefined): void;
}

export const FileTypeFilter: React.FC<Props> = ({ onChange }) => {
  const { data, isLoading } = useAggregatesQuery();

  const fileTypeOptions: Option<string>[] = (data?.fileType ?? []).map(
    (item) => ({
      value: item.name,
      label: item.name,
    })
  );

  return (
    <FilterContainer>
      <Select<Option<string>>
        title="File Type"
        icon="Document"
        options={fileTypeOptions}
        onChange={(option) => onChange(option?.value)}
        isLoading={isLoading}
      />
    </FilterContainer>
  );
};
