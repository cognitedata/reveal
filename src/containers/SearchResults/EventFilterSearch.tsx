import React, { useEffect, useContext } from 'react';
import { Body } from '@cognite/cogs.js';
import { SearchFilterSection, EventTable } from 'components/Common';
import { EventSearchRequest, EventFilter } from 'cognite-sdk-v3';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  searchSelector,
  search,
  count,
  countSelector,
} from '@cognite/cdf-resources-store/dist/events';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { List, Content } from './Common';

// const EventsFilterMapping: { [key: string]: string } = {};

export const buildEventsFilterQuery = (
  filter: EventFilter,
  query: string | undefined
): EventSearchRequest => {
  // const reverseLookup: { [key: string]: string } = Object.keys(
  //   EventsFilterMapping
  // ).reduce((prev, key) => ({ ...prev, [EventsFilterMapping[key]]: key }), {});
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          description: query,
        },
      }),
    filter,
  };
};

export const EventFilterSearch = ({ query = '' }: { query?: string }) => {
  const dispatch = useResourcesDispatch();
  const { eventFilter, setEventFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  const { items: events } = useResourcesSelector(searchSelector)(
    buildEventsFilterQuery(eventFilter, query)
  );
  const { count: eventsCount } = useResourcesSelector(countSelector)(
    buildEventsFilterQuery(eventFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildEventsFilterQuery(eventFilter, query)));
    dispatch(count(buildEventsFilterQuery(eventFilter, query)));
  }, [dispatch, eventFilter, query]);

  const metadataCategories: { [key: string]: string } = {};

  const tmpMetadata = events.reduce(
    (prev, el) => {
      if (el.source && el.source.length !== 0) {
        prev.source.add(el.source);
      }
      if (el.type && el.type.length !== 0) {
        prev.type.add(el.type);
      }
      if (el.subtype && el.subtype.length !== 0) {
        prev.subtype.add(el.subtype);
      }
      Object.keys(el.metadata || {}).forEach(key => {
        if (key === 'source') {
          return;
        }
        if (el.metadata![key].length !== 0) {
          if (!metadataCategories[key]) {
            metadataCategories[key] = 'Metadata';
          }
          if (!prev[key]) {
            prev[key] = new Set<string>();
          }
          prev[key].add(el.metadata![key]);
        }
      });
      return prev;
    },
    { source: new Set(), type: new Set(), subtype: new Set() } as {
      [key: string]: Set<string>;
    }
  );

  const metadata = Object.keys(tmpMetadata).reduce((prev, key) => {
    prev[key] = [...tmpMetadata[key]];
    return prev;
  }, {} as { [key: string]: string[] });

  const filters: { [key: string]: string } = {
    ...(eventFilter.source && { source: eventFilter.source }),
    ...(eventFilter.type && { type: eventFilter.type }),
    ...(eventFilter.subtype && { subtype: eventFilter.subtype }),
    ...eventFilter.metadata,
  };

  return (
    <>
      <SearchFilterSection
        metadata={metadata}
        filters={filters}
        metadataCategory={metadataCategories}
        setFilters={newFilters => {
          const {
            source: newSource,
            type: newType,
            subtype: newSubType,
            ...newMetadata
          } = newFilters;
          setEventFilter({
            source: newSource,
            type: newType,
            subtype: newSubType,
            metadata: newMetadata,
          });
        }}
      />
      <Content>
        <List>
          <Body>
            {query && query.length > 0
              ? `${
                  eventsCount === undefined ? 'Loading' : eventsCount
                } results for "${query}"`
              : `All ${eventsCount === undefined ? '' : eventsCount} results`}
          </Body>
          <EventTable
            events={events}
            onEventClicked={event =>
              openPreview({ item: { id: event.id, type: 'event' } })
            }
            query={query}
          />
        </List>
      </Content>
    </>
  );
};
