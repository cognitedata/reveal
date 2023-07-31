// import { Select } from '@cognite/cogs.js';
import React from 'react';
// import { useDocumentQueryFacets } from '@cognite/react-document-search';

import { FilterContainer } from '../elements';

interface Props {
  onChange(values: string[]): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const LabelFilter: React.FC<Props> = ({ onChange }) => {
  /** disabled temporarily, will be done in future */

  // const { data, isLoading } = useDocumentQueryFacets();

  // const options = data?.labels.map((item) => ({
  //   value: item.name,
  //   label: item.name,
  // }));

  return (
    <FilterContainer>
      {/* <Select<any>
        title="Label"
        icon="Tag"
        options={options}
        onChange={(selectedOptions: any) =>
          onChange(selectedOptions?.map((option: any) => option.value) ?? [])
        }
        isLoading={isLoading}
        isMulti
      /> */}
    </FilterContainer>
  );
};
