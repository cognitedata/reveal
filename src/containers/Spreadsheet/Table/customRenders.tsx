import React, { useContext } from 'react';
import { ColumnShape } from 'react-base-table';
import styled from 'styled-components';
import { Body, Colors, Graphic, Tooltip } from '@cognite/cogs.js';

import { RawExplorerContext } from 'contexts';
import ColumnIcon, { COLUMN_ICON_WIDTH } from 'components/ColumnIcon';

const Comp = ({ item }: any) => item;

type Props = {
  cells: React.ReactElement[];
  columns: ColumnShape[];
};

export const HeaderRender = (props: Props): JSX.Element => {
  const { cells, columns } = props;
  const { setIsProfilingSidebarOpen, selectedColumnKey, setSelectedColumnKey } =
    useContext(RawExplorerContext);

  const onColumnClick = (column: ColumnShape) => {
    setIsProfilingSidebarOpen(true);
    setSelectedColumnKey(column.dataKey);
  };

  return (
    <React.Fragment>
      {columns.map((column, index) => {
        const cell = cells[index];
        const cellResizer = (cell.props?.children ?? []).filter(
          (child: React.ReactElement) =>
            !!child && child.props?.className === 'BaseTable__column-resizer'
        );
        const isIndexColumn = index === 0;
        const isSelected = selectedColumnKey === column.dataKey;
        const child = !isIndexColumn ? (
          <HeaderCell
            key={`${column.title}_${index}`}
            level={3}
            strong
            $isSelected={isSelected}
            onClick={() => onColumnClick(column)}
          >
            {column.dataKey && <ColumnIcon dataKey={column.dataKey} />}
            <Tooltip content={column.title}>
              <HeaderTitle level={3} strong width={cell.props.style.width}>
                {column.title}
              </HeaderTitle>
            </Tooltip>
          </HeaderCell>
        ) : (
          <span key={`${column.title}_${index}`} />
        );
        return (
          <Comp
            key={`${column.title}_${index}`}
            item={React.cloneElement(cell, {
              key: `${column.title}_${index}`,
              ...cell.props,
              children: [child, ...cellResizer],
              style: {
                ...cell.props.style,
              },
            })}
          />
        );
      })}
    </React.Fragment>
  );
};

export const EmptyRender = (): JSX.Element => (
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

const HeaderCell = styled(Body).attrs(
  ({ $isSelected }: { $isSelected: boolean }) => {
    if ($isSelected) return { style: { backgroundColor: '#F2F2F5' } };
  }
)<{ $isSelected: boolean }>`
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
    width > COLUMN_ICON_WIDTH ? width - COLUMN_ICON_WIDTH : width}px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
`;
