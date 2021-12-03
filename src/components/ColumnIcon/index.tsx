import React, { useMemo } from 'react';

import { Icon } from '@cognite/cogs.js';
import { useColumnType } from 'hooks/profiling-service';

export const COLUMN_ICON_WIDTH = 50;

type Props = { dataKey: string | undefined };

export default function ColumnIcon({ dataKey }: Props) {
  const { getColumnType } = useColumnType();

  const columnType = useMemo(
    () => getColumnType(dataKey),
    [getColumnType, dataKey]
  );

  switch (columnType) {
    case 'String':
      return <Icon type="String" />;
    case 'Number':
      return <Icon type="Number" />;
    case 'Boolean':
      return <Icon type="Boolean" />;
    case 'Object':
    case 'Vector':
      return <>ICON_TODO</>;
    default:
      return null;
  }
}
