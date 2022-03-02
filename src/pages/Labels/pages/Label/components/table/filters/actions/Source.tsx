import { Option, Select } from 'components/Select';
import React from 'react';
import { useAggregatesQuery } from 'services/query/aggregates/query';
import { FilterContainer } from '../elements';

interface Props {
  onChange(value: string | undefined): void;
}

export const SourceFilter: React.FC<Props> = ({ onChange }) => {
  const { data, isLoading } = useAggregatesQuery();

  const sourceOptions: Option<string>[] = (data?.source ?? []).map((item) => ({
    value: item.name,
    label: item.name,
  }));

  return (
    <FilterContainer>
      <Select<Option<string>>
        title="Source"
        icon="DataSource"
        options={sourceOptions}
        onChange={(option) => onChange(option?.value)}
        isLoading={isLoading}
      />
    </FilterContainer>
  );
};
