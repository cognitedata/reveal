import React, { useState } from 'react';
import ShowMoreText from 'react-show-more-text';
import { Cell } from 'react-table';

import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';

import { CellContentWrapper, ExpandableCell } from './elements';

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
  const value = children.props.value.id || children.props.value;
  const [expanded, setExpanded] = useState<boolean>(false);

  const isCellValueEmpty = (value: string | number): boolean => {
    return !(
      value &&
      ((isString(value) && value.trim() !== '') || isNumber(value))
    );
  };

  if (isCellValueEmpty(value)) {
    return null;
  }

  // render expandable content
  if (children.props.column.expandableContent) {
    return (
      <ExpandableCell style={{ whiteSpace: expanded ? 'normal' : 'nowrap' }}>
        <ShowMoreText lines={1} more="More" less="Close" onClick={setExpanded}>
          {value}
        </ShowMoreText>
      </ExpandableCell>
    );
  }

  return (
    <CellContentWrapper
      whiteSpace={children.props.column.displayFullText ? 'normal' : 'nowrap'}
    >
      <MiddleEllipsis value={value} />
    </CellContentWrapper>
  );
};
