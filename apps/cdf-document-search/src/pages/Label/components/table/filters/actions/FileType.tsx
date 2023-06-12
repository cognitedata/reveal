import React from 'react';

import { Select, Option } from '../../../../../../components/Select';
import { useAggregatesQuery } from '../../../../../../services/query/aggregates/query';
import { FilterContainer } from '../elements';

interface Props {
  onChange(values: string[]): void;
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
      <Select<Option<string>, true>
        title="File Type"
        icon="Document"
        options={fileTypeOptions}
        onChange={(options) =>
          onChange(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            options?.map((option: { value: string }) => option.value) ?? []
          )
        }
        isLoading={isLoading}
        isMulti
      />
    </FilterContainer>
  );
};
