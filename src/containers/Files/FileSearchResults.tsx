import React, { useEffect, useContext } from 'react';
import { FileTable } from 'components/Common';
import { FilesSearchFilter, FileFilterProps } from 'cognite-sdk-v3';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  searchSelector,
  search,
} from '@cognite/cdf-resources-store/dist/files';
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
  const dispatch = useResourcesDispatch();

  const { fileFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  const { items: files } = useResourcesSelector(searchSelector)(
    buildFilesFilterQuery(fileFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildFilesFilterQuery(fileFilter, query)));
  }, [dispatch, fileFilter, query]);

  return (
    <FileTable
      files={files}
      onFileClicked={file =>
        openPreview({ item: { type: 'file', id: file.id } })
      }
      query={query}
    />
  );
};
