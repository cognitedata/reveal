import { DocumentFilter, DocumentSortItem } from '@cognite/sdk';

import { useProjectConfig } from 'hooks/useProjectConfig';
import { useSortByOptions } from 'modules/resultPanel/selectors';

import { useExtractParentFolderPath } from '../selectors';
import { toSort } from '../utils/toSort';

export const useDocumentSearchOptions = () => {
  const { data: projectConfig } = useProjectConfig();
  const sortByOptions = useSortByOptions();
  const extractParentFolderPath = useExtractParentFolderPath();

  const documentSearchOptions = {
    filters: { ...projectConfig?.documents?.filters },
    sort: sortByOptions.documents?.map(toSort) || [],
  };

  const extractParentFolderOptions: {
    filters?: DocumentFilter;
    sort: DocumentSortItem[];
  } = {
    filters: {
      and: [
        {
          prefix: {
            property: ['sourceFile', 'directory'],
            value: extractParentFolderPath || '',
          },
        },
      ],
    },
    sort: [],
  };

  return extractParentFolderPath
    ? extractParentFolderOptions
    : documentSearchOptions;
};
