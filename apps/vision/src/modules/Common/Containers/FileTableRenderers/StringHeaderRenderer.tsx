import React from 'react';

import { CellRenderer } from '@vision/modules/Common/types';

export function StringHeaderRenderer({ column: { title } }: CellRenderer) {
  return <div>{title}</div>;
}
