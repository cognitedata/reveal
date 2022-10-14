import { DocumentFilter } from '@cognite/sdk';
import { AdvancedFilterBuilder } from 'app/domain/builders';
import { GlobalFilter } from 'app/store/filter/types';

export const mapFiltersToDocumentSearchFilters = ({
  externalIdPrefix,
  source,
  author,
  mimeType,
  createdTime,
  lastUpdatedTime,
  assetSubtreeIds,
}: GlobalFilter['filters']['document']): DocumentFilter | undefined => {
  const builder = new AdvancedFilterBuilder();

  if (assetSubtreeIds) {
    const assetIds = assetSubtreeIds.reduce((acc, item) => {
      if ('id' in item) {
        return [...acc, item.id];
      }
      return acc;
    }, [] as number[]);

    // Note: should we also check for externalId (string)? Currently filter only gives number.
    builder.containsAny(['sourceFile', 'assetIds'], assetIds);
  }

  if (createdTime) {
    const lte = createdTime.max as number | undefined;
    const gte = createdTime.min as number | undefined;

    builder.range(['createdTime'], { lte, gte });
  }

  if (lastUpdatedTime) {
    const lte = lastUpdatedTime.max as number | undefined;
    const gte = lastUpdatedTime.min as number | undefined;

    builder.range(['modifiedTime'], { lte, gte });
  }

  if (author) {
    builder.in(['author'], author);
  }

  if (source) {
    builder.in(['sourceFile', 'source'], source);
  }

  if (mimeType) {
    builder.in(['sourceFile', 'mimeType'], mimeType);
  }

  if (externalIdPrefix) {
    builder.prefix(['externalId'], externalIdPrefix);
  }

  return new AdvancedFilterBuilder().and(builder).build();
};
