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

  const extractParentFolderOptions = {
    filters: {
      sourceFile: {
        directoryPrefix: {
          in: [extractParentFolderPath],
        },
      },
    },
    sort: [],
  };

  return extractParentFolderPath
    ? extractParentFolderOptions
    : documentSearchOptions;
};
