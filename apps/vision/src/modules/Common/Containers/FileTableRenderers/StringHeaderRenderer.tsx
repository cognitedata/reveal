import React from 'react';

import { CellRenderer } from '../../types';

export function StringHeaderRenderer({ column: { title } }: CellRenderer) {
  return <div>{title}</div>;
}
