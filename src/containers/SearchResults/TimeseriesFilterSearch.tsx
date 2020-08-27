import React, { useState, useEffect, useContext } from 'react';
import { Body, Graphic } from '@cognite/cogs.js';
import { SearchFilterSection, TimeseriesTable } from 'components/Common';
import {
  Timeseries,
  TimeseriesSearchFilter,
  TimeseriesFilter,
} from 'cognite-sdk-v3';
import { useSelector, useDispatch } from 'react-redux';
import {
  searchSelector,
  search,
  count,
  countSelector,
} from 'modules/timeseries';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { List, Content, Preview } from './Common';

// const TimeseriessFilterMapping: { [key: string]: string } = {};

const buildTimeseriessFilterQuery = (
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
  const dispatch = useDispatch();
  const { timeseriesFilter, setTimeseriesFilter } = useContext(
    ResourceSelectionContext
  );
  const [selectedTimeseries, setSelectedTimeseries] = useState<
    Timeseries | undefined
  >(undefined);

  const { items: timeseries } = useSelector(searchSelector)(
    buildTimeseriessFilterQuery(timeseriesFilter, query)
  );
  const { count: timeseriesCount } = useSelector(countSelector)(
    buildTimeseriessFilterQuery(timeseriesFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildTimeseriessFilterQuery(timeseriesFilter, query)));
    dispatch(count(buildTimeseriessFilterQuery(timeseriesFilter, query)));
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
                } Results`}
          </Body>
          <TimeseriesTable
            timeseries={timeseries}
            onTimeseriesClicked={setSelectedTimeseries}
            query={query}
          />
        </List>
        <Preview>
          {selectedTimeseries && (
            <TimeseriesSmallPreview timeseriesId={selectedTimeseries.id} />
          )}
          {!selectedTimeseries && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Graphic type="Search" />
              <p>Click on an time series to preview here</p>
            </div>
          )}
        </Preview>
      </Content>
    </>
  );
};
