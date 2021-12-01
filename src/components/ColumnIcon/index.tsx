import React, { useMemo } from 'react';

import { CustomIcon } from 'components/CustomIcon';
import { useColumnType } from 'hooks/profiling-service';
import { useActiveTableContext } from 'contexts';

export const COLUMN_ICON_WIDTH = 50;

export default function ColumnIcon({ title }: { title: string | undefined }) {
  const { database, table } = useActiveTableContext();
  const { getColumnType } = useColumnType(database, table);

  const column = useMemo(() => getColumnType(title), [getColumnType, title]);

  switch (column) {
    case 'String':
      return <CustomIcon icon="StringIcon" />;
    case 'Number':
      return <CustomIcon icon="NumberIcon" />;
    case 'Boolean':
      return <CustomIcon icon="BooleanIcon" />;
    case 'Object':
    case 'Vector':
      return <>ICON_TODO</>;
    default:
      return null;
  }
}
