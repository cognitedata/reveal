// import { Select } from '@cognite/cogs.js';
import React from 'react';
// import { useAggregatesQuery } from 'src/services/query/aggregates/query';
// import { useDocumentQueryFacets } from '@cognite/react-document-search';

import { FilterContainer } from '../elements';

interface Props {
  onChange(values: string[]): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const FileTypeFilter: React.FC<Props> = ({ onChange }) => {
  /** disabled temporarily, will be done in future */
  // const { data, isLoading } = useDocumentQueryFacets();

  // const fileTypeOptions: any = (data?.fileType ?? []).map((item) => ({
  //   value: item.name,
  //   label: item.name,
  // }));

  return (
    <FilterContainer>
      {/* <Select<any>
        title="File Type"
        icon="Document"
        options={fileTypeOptions}
        onChange={(options: any) =>
          onChange(options?.map((option: any) => option.value) ?? [])
        }
        isLoading={isLoading}
        isMulti
      /> */}
    </FilterContainer>
  );
};
