import React, { useMemo, useState } from 'react';
import { FileInfo } from '@cognite/sdk';
import { useCdfItems, useSearch } from '@cognite/sdk-react-query-hooks';
import { useDebounce } from 'use-debounce/lib';

import { Props, OptionTypeBase } from 'react-select';
import { Select } from '@cognite/cogs.js';

type FileOption = { value: number; name: string };

export type FileSelectProps = Props<OptionTypeBase> & {
  onFileSelected: (fileIds?: number[]) => void;
  selectedFiles?: number[];
  fileExtension?: string;
};

/**
 * File select filter, based on file extension if provided.
 */
export const FileSelectFilter = ({
  onFileSelected,
  selectedFiles,
  fileExtension = '',
  ...extraProps
}: FileSelectProps) => {
  const [query, setQuery] = useState(fileExtension);
  const [debouncedQuery] = useDebounce(query, 100);

  const queryObserverResult = useSearch<FileInfo>(
    'files',
    debouncedQuery,
    { limit: 100, filter: {} },
    { enabled: debouncedQuery ? debouncedQuery.length > 0 : false }
  );

  const { isLoading } = queryObserverResult;
  const searchData = !fileExtension
    ? queryObserverResult.data
    : queryObserverResult.data?.filter(
        (item) => item.name.substr(item.name.lastIndexOf('.')) === fileExtension
      );

  const { data: selectedItems } = useCdfItems<FileInfo>(
    'files',
    selectedFiles ? selectedFiles.map((id) => ({ id })) : []
  );

  const [data] = useMemo(() => {
    return [searchData];
  }, [debouncedQuery, searchData]);

  const values = (data || []).map((el) => ({ label: el.name, value: el.id }));
  const selecedValues = (selectedItems || []).map((el) => ({
    label: el.name,
    value: el.id,
  }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { theme, ...filteredExtraProps } = extraProps; // theme type is not compatible for some reason, so remove it

  return (
    <Select
      {...filteredExtraProps}
      isLoading={isLoading}
      options={values}
      value={selecedValues}
      onInputChange={(input: string) => setQuery(input)}
      onChange={(selected: FileOption | FileOption[]) => {
        const selectedValues = 'length' in selected ? selected : [selected];
        if (selectedValues.length === 0) {
          onFileSelected(undefined);
        } else {
          onFileSelected(selectedValues.map((item) => item.value));
        }
      }}
    />
  );
};
