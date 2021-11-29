import React, { useContext } from 'react';
import { ColumnShape } from 'react-base-table';
import styled from 'styled-components';
import { Body, Colors, Graphic, Tooltip } from '@cognite/cogs.js';

import { RawExplorerContext, useActiveTableContext } from 'contexts';
import { CustomIcon } from 'components/CustomIcon';
import { Column, useRawProfile } from 'hooks/sdk-queries';

const TYPE_ICON_WIDTH = 50;

const Comp = ({ item }: any) => item;

function ColumnIcon({ title }: { title: string }) {
  const { database, table } = useActiveTableContext();
  const { data = { columns: {} as Record<string, Column> } } = useRawProfile({
    database,
    table,
    limit: 1000,
  });

  const column = data.columns[title];

  if (!column) {
    return null;
  }
  return (
    <>
      {!!column.number && <CustomIcon icon="NumberIcon" />}
      {!!column.string && <CustomIcon icon="StringIcon" />}
      {!!column.boolean && <CustomIcon icon="BooleanIcon" />}
      {!!column.object && <>ICON_TODO</>}
      {!!column.vector && <>ICON_TODO</>}
    </>
  );
}

type Props = {
  cells: React.ReactElement[];
  columns: ColumnShape[];
};

export const HeaderRender = (props: Props): JSX.Element => {
  const { cells, columns } = props;
  const { setIsProfilingSidebarOpen, setSelectedColumnKey } =
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
        const child = !isIndexColumn ? (
          <HeaderCell level={3} strong onClick={() => onColumnClick(column)}>
            {column.title && <ColumnIcon title={column.title} />}
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
