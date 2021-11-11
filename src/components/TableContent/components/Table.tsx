import React from 'react';
import 'react-base-table/styles.css';
import BaseTable, { Column } from 'react-base-table';
import { columns, data } from 'components/TableContent/mock';

export const Table = (): JSX.Element => {
  return <BaseTable columns={columns} data={data} width={600} height={400} />;
};
