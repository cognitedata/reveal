import React from 'react';
import { Cell } from 'react-table';

import isNil from 'lodash/isNil';
import styled from 'styled-components/macro';

import { Tooltip } from 'components/tooltip';

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

  return (
    <Tooltip title={children} enabled={overflowing}>
      <CellTitle ref={elementRef}>{children}</CellTitle>
    </Tooltip>
  );
};

const CellTitle = styled.p`
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: visible;
  text-overflow: ellipsis;
`;
