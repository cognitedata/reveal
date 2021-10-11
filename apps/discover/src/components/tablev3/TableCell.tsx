import React from 'react';
import { Cell } from 'react-table';

import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import styled from 'styled-components/macro';

import { Tooltip } from 'components/tooltip';

const CellContent = styled.div`
  max-width: 100%;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
  color: var(--cogs-text-color);
`;

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
  const elementRef = React.useRef<HTMLElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);

  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (element) {
      setOverflowing(isElementOverflowing(element));
    }
  }, []);

  const isElementOverflowing = (element: HTMLElement): boolean => {
    if (isNil(element)) return false;
    return element.offsetWidth < element.scrollWidth;
  };

  // Render empty if the cell is empty
  const value = children.props.value.id || children.props.value;
  const isEmpty = !(value && isString(value) && value.trim() !== '');
  if (isEmpty) return null;

  return (
    <CellContent ref={elementRef}>
      <Tooltip title={children} enabled={overflowing}>
        {children}
      </Tooltip>
    </CellContent>
  );
};
