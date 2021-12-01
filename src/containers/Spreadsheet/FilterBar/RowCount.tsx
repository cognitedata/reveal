import React from 'react';
import { Icon, Colors } from '@cognite/cogs.js';
import { useActiveTableContext } from 'contexts';
import { useRawProfile } from 'hooks/profiling-service';

export default function RowCount() {
  const { database, table } = useActiveTableContext();
  const { data = { rowCount: undefined }, isFetched } = useRawProfile({
    database,
    table,
  });

  if (!isFetched) {
    return (
      <Icon
        type="Loading"
        style={{
          color: Colors['greyscale-grey4'].hex(),
          margin: '0 5px',
        }}
      />
    );
  }

  if (!Number.isFinite(data.rowCount)) {
    return null;
  }

  return (
    <>
      {data.rowCount} row{data.rowCount! === 1 ? '' : 's'}
    </>
  );
}
