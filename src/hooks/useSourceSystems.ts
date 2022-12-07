import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import {
  ExtractorLibraryCategory,
  EXTRACTOR_LIBRARY_CATEGORIES,
} from 'components/category-sidebar/CategorySidebarItem';
import { useQuery } from 'react-query';
import { ExtractorBase } from 'service/extractors';

export const getSourceSystemsQueryKey = () => ['source-systems', 'list'];

type SourceSystemBase = ExtractorBase;
export type SourceSystem = SourceSystemBase & {
  category: ExtractorLibraryCategory;
};

export const useSourceSystems = () => {
  const sdk = useSDK();

  return useQuery<SourceSystem[]>(getSourceSystemsQueryKey(), async () => {
    const sourceSystems = await sdk
      .get<{ items: SourceSystemBase[] }>(
        `api/v1/projects/${getProject()}/extractors/sources`,
        {
          headers: {
            'cdf-version': 'beta',
          },
        }
      )
      .then((res) => res.data.items);

    return sourceSystems.map((item) => ({
      ...item,
      category: EXTRACTOR_LIBRARY_CATEGORIES.sourceSystem,
    }));
  });
};
