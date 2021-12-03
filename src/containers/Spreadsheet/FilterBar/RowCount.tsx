import React from 'react';
import { Tooltip, Icon, Colors } from '@cognite/cogs.js';
import { useActiveTableContext } from 'contexts';
import { FULL_PROFILE_LIMIT, useFullProfile } from 'hooks/profiling-service';

export default function RowCount() {
  const { database, table } = useActiveTableContext();
  const { data = { rowCount: undefined }, isFetched } = useFullProfile({
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
  if (data.rowCount === FULL_PROFILE_LIMIT) {
    return (
      <Tooltip
        placement="bottom"
        content="This table contains more than 1 million rows."
      >
        <>{'>1M'}</>
      </Tooltip>
    );
  }
  return (
    <>
      {data.rowCount} row{data.rowCount! === 1 ? '' : 's'}
    </>
  );
}
