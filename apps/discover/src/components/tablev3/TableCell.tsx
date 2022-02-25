import React from 'react';
import { Cell } from 'react-table';

import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';

import { CellContentWrapper } from './elements';

interface Props {
  cell: Cell<any>;
}
export const TableCell: React.FC<Props> = React.memo(({ cell }) => {
  const isCellValueText = !isNil(cell?.value);
  const Wrapper = isCellValueText ? CellText : React.Fragment;

  // In case of undefined cell, render empty content (opposed to crashing).
  return <Wrapper>{cell?.render('Cell')}</Wrapper>;
});

const CellText = ({ children }: any) => {
  const isCellValueEmpty = (value: string | number): boolean => {
    return !(
      value &&
      ((isString(value) && value.trim() !== '') || isNumber(value))
    );
  };

  // Render empty if the cell is empty
  const value = children.props.value.id || children.props.value;
  if (isCellValueEmpty(value)) return null;

  return (
    <CellContentWrapper
      whiteSpace={children.props.column.displayFullText ? 'normal' : 'nowrap'}
    >
      <MiddleEllipsis value={value} />
    </CellContentWrapper>
  );
};
