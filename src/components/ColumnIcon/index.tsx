import React from 'react';

import { CustomIcon } from 'components/CustomIcon';
import { useColumnType } from 'hooks/column-type';

export const COLUMN_ICON_WIDTH = 50;

export default function ColumnIcon({ title }: { title: string | undefined }) {
  const { getColumn } = useColumnType();

  const column = getColumn(title);

  if (!column) return null;
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
