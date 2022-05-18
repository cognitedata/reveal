import React from 'react';

import { NdsWellsTable } from './NdsWellsTable';
import { NdsTableProps } from './types';

export const NdsTable: React.FC<NdsTableProps> = ({ data }) => {
  return <NdsWellsTable data={data} />;
};
