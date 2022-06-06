import { SearchRequestOptions } from 'domain/documents/service/network/searchDocument';

import { useProjectConfig } from 'hooks/useProjectConfig';
import { useSortByOptions } from 'modules/resultPanel/selectors';

import { useExtractParentFolderPath } from '../selectors';
import { toSort } from '../utils/toSort';

export const useDocumentSearchOptions = (): SearchRequestOptions => {
  const { data: projectConfig } = useProjectConfig();
  const sortByOptions = useSortByOptions();
  const extractParentFolderPath = useExtractParentFolderPath();

  const documentSearchOptions: SearchRequestOptions = {
    filter: { ...projectConfig?.documents?.filters },
    sort: sortByOptions.documents?.map(toSort) || [],
  };

  const extractParentFolderOptions: SearchRequestOptions = {
    filter: {
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
