import React from 'react';

import { useActiveTableContext } from 'contexts';
import { CustomIcon } from 'components/CustomIcon';
import { Column, useRawProfile } from 'hooks/sdk-queries';

export const COLUMN_ICON_WIDTH = 50;

export default function ColumnIcon({ title }: { title: string }) {
  const { database, table } = useActiveTableContext();
  const { data = { columns: {} as Record<string, Column> } } = useRawProfile({
    database,
    table,
    limit: 1000,
  });

  const column = data.columns[title];

  if (!column) {
    return null;
  }
  return (
    <>
      {!!column.number && <CustomIcon icon="NumberIcon" />}
      {!!column.string && <CustomIcon icon="StringIcon" />}
      {!!column.boolean && <CustomIcon icon="BooleanIcon" />}
      {!!column.object && <>ICON_TODO</>}
      {!!column.vector && <>ICON_TODO</>}
    </>
  );
}
