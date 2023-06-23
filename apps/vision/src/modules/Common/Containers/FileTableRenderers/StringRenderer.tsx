import React from 'react';

export function StringRenderer(cellProps: { cellData: string }) {
  return <div>{cellProps.cellData}</div>;
}
