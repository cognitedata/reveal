import React, { useMemo } from 'react';

import { CustomIcon } from 'components/CustomIcon';
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
