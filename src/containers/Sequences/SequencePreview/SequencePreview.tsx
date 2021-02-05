import React, { useMemo } from 'react';
import { Sequence } from '@cognite/sdk';

import { useInfiniteSequenceRows } from 'hooks/sequenceHooks';
import {
  SequenceDataTable,
  SequenceDataRow,
} from 'containers/Sequences/SequenceDataTable/SequenceDataTable';

import { Loader } from 'components';

export const SequencePreview = ({ sequence }: { sequence: Sequence }) => {
  const {
    data,
    isFetched,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSequenceRows(
    {
      id: sequence.id,
    },
    100
  );

  /*
    The trick here is to add the latest paginated results to the bottom of the existing array.
    Next up for sequences is to make sure all values are displayed as string.
    There is an unknown here for whether this will work for all kinds of sequences.
    This will support: null, strings, doubles and longs
  */
  const listItems = useMemo(
    () =>
      data?.pages?.reduce(
        (accl, t) =>
          accl.concat(
            t.rows.map(row => ({
              rowNumber: row.rowNumber,
              key: `${row.rowNumber}`,
              ...Object.values(row.values).reduce(
                (acc, val, i) => ({ ...acc, [i]: `${val}` }),
                {}
              ),
            }))
          ),
        [] as SequenceDataRow[]
      ),
    [data]
  );

  if (!isFetched) {
    return <Loader />;
  }
  if (!data) {
    return <Loader />;
  }

  const handleOnEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SequenceDataTable
      onEndReached={handleOnEndReached}
      sequence={sequence}
      rows={listItems || []}
    />
  );
};
