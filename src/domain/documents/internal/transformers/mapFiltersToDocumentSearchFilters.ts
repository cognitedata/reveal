import { AdvancedFilterBuilder, AdvancedFilter } from '../../../builders';
import { InternalDocumentFilter } from '../types';

type DocumentProperties = {
  'sourceFile|assetIds': number[];
  author: string[];
  'sourceFile|source': string[];
  type: string[];
  externalId: string;
};

export const mapFiltersToDocumentSearchFilters = ({
  externalIdPrefix,
  source,
  author,
  type,
  createdTime,
  lastUpdatedTime,
  assetSubtreeIds,
}: InternalDocumentFilter): AdvancedFilter<DocumentProperties> | undefined => {
  const builder = new AdvancedFilterBuilder<DocumentProperties>()
    .containsAny('sourceFile|assetIds', () => {
      return assetSubtreeIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .in('author', author)
    .in('sourceFile|source', source)
    .in('type', type)
    .prefix('externalId', externalIdPrefix)
    .range('createdTime', {
      lte: createdTime?.max as number,
      gte: createdTime?.min as number,
    })
    .range('modifiedTime', {
      lte: lastUpdatedTime?.max as number,
      gte: lastUpdatedTime?.min as number,
    });

  return new AdvancedFilterBuilder<DocumentProperties>().and(builder).build();
};
