import { useActiveTableContext } from 'contexts';
import { Column, useRawProfile } from 'hooks/sdk-queries';

export const useColumnType = () => {
  const { database, table } = useActiveTableContext();
  const { data = { columns: {} as Record<string, Column> } } = useRawProfile({
    database,
    table,
    limit: 1000,
  });

  const getColumn = (title: string | undefined) => {
    const column = title ? data.columns[title] : null;
    return column;
  };

  const getColumnType = (title: string | undefined) => {
    const column = getColumn(title);

    if (!column) return 'Unknown';

    if (!!column.number) return 'Number';
    if (!!column.string) return 'Text';
    if (!!column.boolean) return 'Boolean';
    // @ts-ignore:next-line
    if (!!column.datetime) return 'DateTime';
    if (!!column.object) return 'Object';
    if (!!column.vector) return 'Vector';
    return 'Unknown';
  };

  return { getColumn, getColumnType };
};
