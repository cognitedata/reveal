import React from 'react';
import { CellRenderer } from 'src/modules/Common/types';

export function DateRenderer({ rowData: { createdTime } }: CellRenderer) {
  const date = createdTime ? formatDate(createdTime) : 'N/A';

  return <div>{date}</div>;
}

function formatDate(date: Date) {
  let month = `${date.getMonth() + 1}`;
  let day = `${date.getDate()}`;
  const year = date.getFullYear();
  let hour = `${date.getHours()}`;
  let minutes = `${date.getMinutes()}`;
  let seconds = `${date.getSeconds()}`;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;
  if (hour.length < 2) hour = `0${hour}`;
  if (minutes.length < 2) minutes = `0${minutes}`;
  if (seconds.length < 2) seconds = `0${seconds}`;

  return `${[year, month, day].join('-')}, ${[hour, minutes, seconds].join(
    ':'
  )}`;
}
