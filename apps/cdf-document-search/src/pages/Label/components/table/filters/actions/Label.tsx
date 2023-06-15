import React from 'react';

import { Select, Option } from '../../../../../../components/Select';
import { useAggregatesQuery } from '../../../../../../services/query/aggregates/query';
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onChange(selectedOptions?.map((option) => option.value) ?? [])
        }
        isLoading={isLoading}
        isMulti
      />
    </FilterContainer>
  );
};
