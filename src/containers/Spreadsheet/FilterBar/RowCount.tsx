import React from 'react';
import { Icon, Colors } from '@cognite/cogs.js';
import { useActiveTableContext } from 'contexts';
import { useTotalRowCount } from 'hooks/sdk-queries';

export default function RowCount() {
  const { database, table } = useActiveTableContext();
  const { data: totalRows, isFetched } = useTotalRowCount({ database, table });

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

  if (!Number.isFinite(totalRows)) {
    return null;
  }

  return (
    <>
      {totalRows} row{totalRows! === 1 ? '' : 's'}
    </>
  );
}
