import React, { useContext } from 'react';
import { ColumnShape } from 'react-base-table';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import ColumnIcon, {
  COLUMN_ICON_WIDTH,
} from '@transformations/components/column-icon';
import Tooltip from '@transformations/components/tooltip';
import { RawExplorerContext } from '@transformations/contexts';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Colors, Flex, Icon } from '@cognite/cogs.js';

const Comp = ({ item }: any) => item;

type Props = {
  cells: React.ReactElement[];
  columns: ColumnShape[];
  database: string;
  table: string;
};

export const HeaderRender = (props: Props): JSX.Element => {
  const { cells, columns } = props;
  const { selectedColumnKey } = useContext(RawExplorerContext);

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
          >
            {column.dataKey && (
              <ColumnIcon
                database={props.database}
                table={props.table}
                dataKey={column.dataKey}
              />
            )}
            <Tooltip content={<TooltipWrapper>{column.title}</TooltipWrapper>}>
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

const TooltipWrapper = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0px;
`;

type EmptyRenderProps = {
  database: string;
  table: string;
};

export const EmptyRender = ({
  database,
  table,
}: EmptyRenderProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <EmptyTable>
      <EmptyTableText level={2} strong>
        {t('empty-table-info')}
      </EmptyTableText>
      <EmptyTableText level={2} strong>
        <Link
          to={createLink('/raw', {
            activeTable: JSON.stringify([database, table, null]),
          })}
          target="_blank"
        >
          <Flex gap={9} alignItems="center">
            {t('edit-in-raw-explorer')}
            <Icon type="ExternalLink" />
          </Flex>
        </Link>
      </EmptyTableText>
    </EmptyTable>
  );
};

const fakeTableColor = `${Colors['decorative--grayscale--400']}`;

const EmptyTable = styled.div`
  gap: 8px;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background-size: 180px 36px;
  background-position: -130px 0;
  background-image: linear-gradient(
      to right,
      ${fakeTableColor} 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, ${fakeTableColor} 1px, transparent 1px);
`;

const EmptyTableText = styled(Body)`
  color: ${Colors['text-icon--medium']};
  text-align: center;
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
  color: ${Colors['text-icon--medium']};
  padding: 0 4px;
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
