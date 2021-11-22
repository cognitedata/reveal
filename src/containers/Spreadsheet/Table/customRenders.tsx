import React from 'react';
import { ColumnShape } from 'react-base-table';
import styled from 'styled-components';
import { Body, Colors, Graphic, Tooltip } from '@cognite/cogs.js';

import { CustomIcon } from 'components/CustomIcon';

const TYPE_ICON_WIDTH = 50;

const Comp = ({ item }: any) => item;

export const headerRenderer = ({
  cells,
  columns,
}: {
  cells: React.ReactElement[];
  columns: ColumnShape[];
}) => {
  const onColumnClick = (_column: ColumnShape) => {
    /** Select column to show in the right sidebar */
  };

  return columns.map((column, index) => {
    const cell = cells[index];
    const cellResizer = (cell.props?.children ?? []).filter(
      (child: React.ReactElement) =>
        !!child && child.props?.className === 'BaseTable__column-resizer'
    );
    const isIndexColumn = index === 0;
    const child = !isIndexColumn ? (
      <HeaderCell level={3} strong onClick={() => onColumnClick(column)}>
        <CustomIcon icon="NumberIcon" />
        <Tooltip content={column.title}>
          <HeaderTitle level={3} strong width={cell.props.style.width}>
            {column.title}
          </HeaderTitle>
        </Tooltip>
      </HeaderCell>
    ) : (
      <span />
    );
    return (
      <Comp
        item={React.cloneElement(cell, {
          ...cell.props,
          children: [child, ...cellResizer],
          style: {
            ...cell.props.style,
          },
        })}
      />
    );
  });
};

export const emptyRenderer = () => (
  <EmptyTable>
    <Graphic type="Search" />
    <Body level={2} strong style={{ color: Colors['text-secondary'].hex() }}>
      This table is empty.
    </Body>
  </EmptyTable>
);

const EmptyTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  & > * {
    margin: 12px 0;
  }
`;

const HeaderCell = styled(Body)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  color: ${Colors['text-secondary'].hex()};
  padding: 0 4px;
  cursor: pointer;
  & > * {
    display: flex;
    margin: 0 4px;
  }
`;

const HeaderTitle = styled(Body)<{ width: number }>`
  width: ${({ width }) =>
    width > TYPE_ICON_WIDTH ? width - TYPE_ICON_WIDTH : width}px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
`;
