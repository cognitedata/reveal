import React from 'react';

import { ReorderButton } from 'components/Buttons';

import { EXPANSION_COLUMN_ID, SELECTION_COLUMN_ID } from './hooks';

interface Props {
  column: any;
}

export const TableColumnSortIcons: React.FC<Props> = (props) => {
  const { column } = props;

  if (column.id === SELECTION_COLUMN_ID || column.id === EXPANSION_COLUMN_ID) {
    return null;
  }

  if (column.isSorted) {
    return column.isSortedDesc ? (
      <ReorderButton.Descending />
    ) : (
      <ReorderButton.Ascending />
    );
  }
  return <ReorderButton.Default />;
};
