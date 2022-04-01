import React from 'react';

import { Icon, Colors } from '@cognite/cogs.js';

import Tooltip from 'components/Tooltip/Tooltip';
import { useActiveTableContext } from 'contexts';
import {
  FULL_PROFILE_LIMIT,
  useFullProfile,
  Profile,
} from 'hooks/profiling-service';

export default function RowCount() {
  const { database, table } = useActiveTableContext();
  const { data = {}, isFetched } = useFullProfile({
    database,
    table,
  });

  const { rowCount = undefined, isComplete = false } = data as Profile;

  const isPartialProfiling =
    rowCount === FULL_PROFILE_LIMIT || (isFetched && !isComplete);

  if (!isFetched) {
    return (
      <Icon
        type="Loader"
        style={{
          color: Colors['greyscale-grey4'].hex(),
          margin: '0 5px',
        }}
      />
    );
  }

  if (!Number.isFinite(rowCount)) {
    return null;
  }
  if (isPartialProfiling) {
    const fixedRowCount =
      rowCount && rowCount < FULL_PROFILE_LIMIT ? rowCount : '1 million';
    const fixedRowCountAbbreviated = `>
      ${rowCount && rowCount < FULL_PROFILE_LIMIT ? rowCount : '1M'}`;
    return (
      <Tooltip
        placement="bottom"
        content={`This table contains more than ${fixedRowCount} rows.`}
      >
        <>{fixedRowCountAbbreviated}</>
      </Tooltip>
    );
  }
  return (
    <>
      {rowCount} row{rowCount! === 1 ? '' : 's'}
    </>
  );
}
