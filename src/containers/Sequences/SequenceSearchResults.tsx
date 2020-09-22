import React, { useEffect, useContext } from 'react';
import { SequenceTable } from 'components/Common';
import { SequenceSearchFilter, SequenceFilter } from 'cognite-sdk-v3';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  searchSelector,
  search,
} from '@cognite/cdf-resources-store/dist/sequences';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';

export const buildSequencesFilterQuery = (
  filter: SequenceFilter['filter'],
  query: string | undefined
): SequenceSearchFilter => {
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

export const SequenceSearchResults = ({ query = '' }: { query?: string }) => {
  const dispatch = useResourcesDispatch();
  const { sequenceFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  const { items: sequences } = useResourcesSelector(searchSelector)(
    buildSequencesFilterQuery(sequenceFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildSequencesFilterQuery(sequenceFilter, query)));
  }, [dispatch, sequenceFilter, query]);

  return (
    <SequenceTable
      sequences={sequences}
      onSequenceClicked={sequence =>
        openPreview({ item: { id: sequence.id, type: 'sequence' } })
      }
      query={query}
    />
  );
};
