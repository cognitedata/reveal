import React from 'react';
import { CellRenderer } from '../../Types';

export function DateRenderer({ rowData: { sourceCreatedTime } }: CellRenderer) {
  const date = sourceCreatedTime ? formatDate(sourceCreatedTime) : 'N/A';

  return <div>{date}</div>;
}

function formatDate(date: Date) {
  let month = `${date.getMonth() + 1}`;
  let day = `${date.getDate()}`;
  const year = date.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join('-');
}
