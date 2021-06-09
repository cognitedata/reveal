import React from 'react';
import { CellRenderer } from 'src/modules/Common/types';

export function StringHeaderRenderer({ column: { title } }: CellRenderer) {
  return <div>{title}</div>;
}
