import React from 'react';

export function StringHeaderRenderer(cellProps: { column: { title: string } }) {
  return <div>{cellProps.column.title}</div>;
}
