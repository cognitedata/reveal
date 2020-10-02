import React, { useContext } from 'react';
import { FileTable } from 'components/Common';
import { FilesSearchFilter, FileFilterProps } from 'cognite-sdk-v3';
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
    <FileTable
      onFileClicked={file =>
        openPreview({ item: { type: 'file', id: file.id } })
      }
      query={query}
      filter={fileFilter}
    />
  );
};
