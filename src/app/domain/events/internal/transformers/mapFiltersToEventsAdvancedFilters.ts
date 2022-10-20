import { AdvancedFilterBuilder, AdvancedFilter } from 'app/domain/builders';
import { InternalEventsFilters } from 'app/domain/events/internal/types';

type EventsProperties = {
  assetIds: number[];
  type: string;
  subtype: string;
  source: string[];
  [key: `metadata.${string}`]: string;
};

export const mapFiltersToEventsAdvancedFilters = ({
  source,
  type,
  subtype,
  metadata,
  assetSubtreeIds,
  createdTime,
  lastUpdatedTime,
}: InternalEventsFilters): AdvancedFilter<EventsProperties> | undefined => {
  const builder = new AdvancedFilterBuilder<EventsProperties>()
    .containsAny('assetIds', () => {
      return assetSubtreeIds?.reduce((acc, item) => {
        if ('id' in item) {
          return [...acc, item.id];
        }
        return acc;
      }, [] as number[]);
    })
    .equals('type', type)
    .equals('subtype', subtype)
    .in('source', () => {
      if (source) {
        return [source];
      }
    })
    .range('createdTime', {
      lte: createdTime?.max as number,
      gte: createdTime?.min as number,
    })
    .range('lastUpdatedTime', {
      lte: lastUpdatedTime?.max as number,
      gte: lastUpdatedTime?.min as number,
    });

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      builder.equals(`metadata.${key}`, value);
    }
  }
  return new AdvancedFilterBuilder<EventsProperties>().and(builder).build();
};
