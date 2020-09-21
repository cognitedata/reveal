import React, { useEffect, useContext } from 'react';
import { Body } from '@cognite/cogs.js';
import { SearchFilterSection, SequenceTable } from 'components/Common';
import { SequenceSearchFilter, SequenceFilter } from 'cognite-sdk-v3';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  searchSelector,
  search,
  count,
  countSelector,
} from '@cognite/cdf-resources-store/dist/sequences';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { List, Content } from './Common';

// const SequencesFilterMapping: { [key: string]: string } = {};

export const buildSequencesFilterQuery = (
  filter: SequenceFilter['filter'],
  query: string | undefined
): SequenceSearchFilter => {
  // const reverseLookup: { [key: string]: string } = Object.keys(
  //   SequencesFilterMapping
  // ).reduce((prev, key) => ({ ...prev, [SequencesFilterMapping[key]]: key }), {});
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

export const SequenceFilterSearch = ({ query = '' }: { query?: string }) => {
  const dispatch = useResourcesDispatch();
  const { sequenceFilter, setSequenceFilter } = useContext(
    ResourceSelectionContext
  );
  const { openPreview } = useResourcePreview();

  const { items: sequences } = useResourcesSelector(searchSelector)(
    buildSequencesFilterQuery(sequenceFilter, query)
  );
  const { count: sequencesCount } = useResourcesSelector(countSelector)(
    buildSequencesFilterQuery(sequenceFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildSequencesFilterQuery(sequenceFilter, query)));
    dispatch(count(buildSequencesFilterQuery(sequenceFilter, query)));
  }, [dispatch, sequenceFilter, query]);

  const metadataCategories: { [key: string]: string } = {};

  const tmpMetadata = sequences.reduce((prev, el) => {
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
    ...(sequenceFilter || {}).metadata,
  };

  return (
    <>
      <SearchFilterSection
        metadata={metadata}
        filters={filters}
        metadataCategory={metadataCategories}
        setFilters={newFilters => {
          setSequenceFilter({
            metadata: newFilters,
          });
        }}
      />
      <Content>
        <List>
          <Body>
            {query && query.length > 0
              ? `${
                  sequencesCount === undefined ? 'Loading' : sequencesCount
                } results for "${query}"`
              : `All ${
                  sequencesCount === undefined ? '' : sequencesCount
                } results`}
          </Body>
          <SequenceTable
            sequences={sequences}
            onSequenceClicked={sequence =>
              openPreview({ item: { id: sequence.id, type: 'sequence' } })
            }
            query={query}
          />
        </List>
      </Content>
    </>
  );
};
