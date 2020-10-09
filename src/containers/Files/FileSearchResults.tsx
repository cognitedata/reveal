import React, { useContext } from 'react';
import { ResourceTable } from 'components/Common';
import { FilesSearchFilter, FileFilterProps, FileInfo } from '@cognite/sdk';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';

export const buildFilesFilterQuery = (
  filter: FileFilterProps,
  query: string | undefined
): FilesSearchFilter => {
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          name: query,
        },
      }),
    filter,
  };
};

export const FileSearchResults = ({ query = '' }: { query?: string }) => {
  const { fileFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  return (
    <ResourceTable<FileInfo>
      api="files"
      filter={fileFilter}
      query={query}
      onRowClick={file => openPreview({ item: { id: file.id, type: 'file' } })}
    />
  );
};
