import React, { useMemo } from 'react';

import { useActiveTableContext } from '@raw-explorer/contexts';
import {
  FULL_PROFILE_LIMIT,
  useColumnType,
} from '@raw-explorer/hooks/profiling-service';

import { Icon } from '@cognite/cogs.js';

export const COLUMN_ICON_WIDTH = 50;

type Props = { dataKey: string | undefined };

export default function ColumnIcon({ dataKey }: Props) {
  const { database, table } = useActiveTableContext();
  const quickColumnTypes = useColumnType(database, table);
  const fullColumnTypes = useColumnType(database, table, FULL_PROFILE_LIMIT);
  const { getColumnType, isFetched } = fullColumnTypes.isFetched
    ? fullColumnTypes
    : quickColumnTypes;

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
      return <Icon type="CodeBraces" />;
    case 'Vector':
      return <Icon type="CodeBrackets" />;
    case 'key':
      return <Icon type="Key" />;
    case 'Loading':
      return <Icon type="Loader" />;
    default:
      return null;
  }
}
