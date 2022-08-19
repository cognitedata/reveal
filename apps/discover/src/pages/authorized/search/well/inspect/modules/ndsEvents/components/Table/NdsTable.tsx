import * as React from 'react';

import { NdsWellsTable } from './NdsWellsTable';
import { NdsTableProps } from './types';

export const NdsTable: React.FC<NdsTableProps> = ({ data, onClickView }) => {
  return <NdsWellsTable data={data} onClickView={onClickView} />;
};
