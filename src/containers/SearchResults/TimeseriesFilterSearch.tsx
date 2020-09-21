import React, { useEffect, useContext } from 'react';
import { Body } from '@cognite/cogs.js';
import { SearchFilterSection, TimeseriesTable } from 'components/Common';
import { TimeseriesSearchFilter, TimeseriesFilter } from 'cognite-sdk-v3';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  searchSelector,
  search,
  count,
  countSelector,
} from '@cognite/cdf-resources-store/dist/timeseries';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { List, Content } from './Common';

// const TimeseriessFilterMapping: { [key: string]: string } = {};

export const buildTimeseriesFilterQuery = (
  filter: TimeseriesFilter,
  query: string | undefined
): TimeseriesSearchFilter => {
  // const reverseLookup: { [key: string]: string } = Object.keys(
  //   TimeseriessFilterMapping
  // ).reduce((prev, key) => ({ ...prev, [TimeseriessFilterMapping[key]]: key }), {});
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

export const TimeseriesFilterSearch = ({ query = '' }: { query?: string }) => {
  const dispatch = useResourcesDispatch();
  const { timeseriesFilter, setTimeseriesFilter } = useContext(
    ResourceSelectionContext
  );
  const { openPreview } = useResourcePreview();

  const { items: timeseries } = useResourcesSelector(searchSelector)(
    buildTimeseriesFilterQuery(timeseriesFilter, query)
  );
  const { count: timeseriesCount } = useResourcesSelector(countSelector)(
    buildTimeseriesFilterQuery(timeseriesFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildTimeseriesFilterQuery(timeseriesFilter, query)));
    dispatch(count(buildTimeseriesFilterQuery(timeseriesFilter, query)));
  }, [dispatch, timeseriesFilter, query]);

  const metadataCategories: { [key: string]: string } = {};

  const tmpMetadata = timeseries.reduce((prev, el) => {
    if (!prev.unit) {
      prev.unit = new Set<string>();
    }
    if (el.unit && el.unit.length !== 0) {
      prev.unit.add(el.unit);
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
  }, {} as { [key: string]: Set<string> });

  const metadata = Object.keys(tmpMetadata).reduce((prev, key) => {
    prev[key] = [...tmpMetadata[key]];
    return prev;
  }, {} as { [key: string]: string[] });

  const filters: { [key: string]: string } = {
    ...(timeseriesFilter.unit && { unit: timeseriesFilter.unit }),
    ...timeseriesFilter.metadata,
  };
  return (
    <>
      <SearchFilterSection
        metadata={metadata}
        filters={filters}
        metadataCategory={metadataCategories}
        setFilters={newFilters => {
          const { unit: newUnit, ...newMetadata } = newFilters;
          setTimeseriesFilter({
            unit: newUnit,
            metadata: newMetadata,
          });
        }}
      />
      <Content>
        <List>
          <Body>
            {query && query.length > 0
              ? `${
                  timeseriesCount === undefined ? 'Loading' : timeseriesCount
                } results for "${query}"`
              : `All ${
                  timeseriesCount === undefined ? '' : timeseriesCount
                } results`}
          </Body>
          <TimeseriesTable
            timeseries={timeseries}
            onTimeseriesClicked={ts =>
              openPreview({ item: { id: ts.id, type: 'timeSeries' } })
            }
            query={query}
          />
        </List>
      </Content>
    </>
  );
};
