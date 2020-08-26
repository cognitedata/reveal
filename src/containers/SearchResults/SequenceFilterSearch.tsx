import React, { useState, useEffect, useContext } from 'react';
import { Body, Graphic } from '@cognite/cogs.js';
import { SearchFilterSection, SequenceTable } from 'components/Common';
import { Sequence, SequenceSearchFilter, SequenceFilter } from 'cognite-sdk-v3';
import { useSelector, useDispatch } from 'react-redux';
import {
  searchSelector,
  search,
  count,
  countSelector,
} from 'modules/sequences';
import { SequenceSmallPreview } from 'containers/Sequences';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { List, Content, Preview } from './Common';

// const SequencesFilterMapping: { [key: string]: string } = {};

const buildSequencesFilterQuery = (
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
  const dispatch = useDispatch();
  const { sequenceFilter, setSequenceFilter } = useContext(
    ResourceSelectionContext
  );
  const [selectedSequence, setSelectedSequence] = useState<
    Sequence | undefined
  >(undefined);

  const { items: sequences } = useSelector(searchSelector)(
    buildSequencesFilterQuery(sequenceFilter, query)
  );
  const { count: sequencesCount } = useSelector(countSelector)(
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
                } Results`}
          </Body>
          <SequenceTable
            sequences={sequences}
            onSequenceClicked={setSelectedSequence}
            query={query}
          />
        </List>
        <Preview>
          {selectedSequence && (
            <SequenceSmallPreview sequenceId={selectedSequence.id} />
          )}
          {!selectedSequence && (
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
              <p>Click on an sequence to preview here</p>
            </div>
          )}
        </Preview>
      </Content>
    </>
  );
};
