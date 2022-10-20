import { AdvancedFilterBuilder, AdvancedFilter } from 'app/domain/builders';
import { InternalDocumentFilter } from 'app/domain/document/internal/types';

type DocumentProperties = {
  'sourceFile.assetIds': number[];
  author: string[];
  'sourceFile.source': string[];
  'sourceFile.mimeType': string[];
  externalId: string;
};

export const mapFiltersToDocumentSearchFilters = ({
  externalIdPrefix,
  source,
  author,
  mimeType,
  createdTime,
  lastUpdatedTime,
  assetSubtreeIds,
}: InternalDocumentFilter): AdvancedFilter<DocumentProperties> | undefined => {
  const builder = new AdvancedFilterBuilder<DocumentProperties>()
    .containsAny('sourceFile.assetIds', () => {
      return assetSubtreeIds?.reduce((acc, item) => {
        if ('id' in item) {
          return [...acc, item.id];
        }
        return acc;
      }, [] as number[]);
    })
    .in('author', author)
    .in('sourceFile.source', source)
    .in('sourceFile.mimeType', mimeType)
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
