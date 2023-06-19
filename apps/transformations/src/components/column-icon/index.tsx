import { useMemo } from 'react';

import { CustomIcon } from '@transformations/components/custom-icon';
import { useColumnType } from '@transformations/hooks/profiling-service';

import { Icon } from '@cognite/cogs.js';

export const COLUMN_ICON_WIDTH = 50;

type Props = { database: string; table: string; dataKey: string | undefined };

export default function ColumnIcon({ database, table, dataKey }: Props) {
  const { getColumnType, isFetched } = useColumnType(database, table);

  const columnType = useMemo(
    () => (isFetched ? getColumnType(dataKey) : 'Loading'),
    [getColumnType, isFetched, dataKey]
  );

  switch (columnType) {
    case 'String':
      return <Icon type="String" />;
    case 'Number':
      return <Icon type="Number" />;
    case 'Boolean':
      return <Icon type="Boolean" />;
    case 'Object':
      return <CustomIcon icon="ObjectIcon" />;
    case 'Vector':
      return <CustomIcon icon="ArrayIcon" />;
    case 'key':
      return <CustomIcon icon="KeyIcon" />;
    case 'Loading':
      return <Icon type="Loader" />;
    default:
      return null;
  }
}
