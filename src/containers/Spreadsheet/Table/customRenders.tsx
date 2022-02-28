import React, { useContext, useState } from 'react';

import { Body, Button, Colors, Flex, Icon, Title } from '@cognite/cogs.js';
import { ColumnShape } from 'react-base-table';
import styled from 'styled-components';

import {
  RawExplorerContext,
  useActiveTableContext,
  useProfilingSidebar,
} from 'contexts';

import ColumnIcon, { COLUMN_ICON_WIDTH } from 'components/ColumnIcon';
import Tooltip from 'components/Tooltip/Tooltip';
import { CustomIcon } from 'components/CustomIcon';
import UploadCSV from 'components/UploadCSV';
import { useQueryClient } from 'react-query';
import { rowKey } from 'hooks/sdk-queries';

const Comp = ({ item }: any) => item;

type Props = {
  cells: React.ReactElement[];
  columns: ColumnShape[];
};

export const HeaderRender = (props: Props): JSX.Element => {
  const { cells, columns } = props;
  const { setIsProfilingSidebarOpen } = useProfilingSidebar();
  const { selectedColumnKey, setSelectedColumnKey } =
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
`;

const Box = styled.div`
  width: 280px;
  padding: 28px;
  margin: 20px;
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  background-color: ${Colors.white.hex()};
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  .cogs-title-5 {
    margin-bottom: 16px;
  }
  .icon-hover {
    display: none;
  }
  .text-icon {
    color: ${Colors['greyscale-grey4'].hex()};
    min-height: 50px;
  }
  .icon {
    display: inital;
  }
  &:hover {
    background-color: ${Colors['midblue-7'].hex()};
    border-color: ${Colors['midblue-3'].hex()};
    .icon-hover {
      display: initial;
    }
    .icon {
      display: none;
    }
    .text-icon {
      color: ${Colors['midblue-3'].hex()};
    }
  }
`;

export const EmptyRender = (): JSX.Element => {
  const [csvModalVisible, setCSVModalVisible] = useState(false);
  const { database, table } = useActiveTableContext();
  const queryClient = useQueryClient();
  return (
    <EmptyTable>
      {csvModalVisible && (
        <UploadCSV
          setCSVModalVisible={(visible, tableChanged) => {
            setCSVModalVisible(visible);
            if (tableChanged) {
              queryClient.invalidateQueries(
                rowKey(database!, table!, 0).slice(0, 3)
              );
            }
          }}
        />
      )}
      <EmptyTableText level={2} strong>
        This table is empty. Upload a CSV file or write data directly using the
        API.
      </EmptyTableText>
      <Flex wrap="wrap" justifyContent="center">
        <Box onClick={() => setCSVModalVisible(true)}>
          <p style={{ height: 50 }}>
            <CustomIcon className="icon" icon="DocumentIconDisabled" />
            <CustomIcon className="icon-hover" icon="DocumentIconHover" />
          </p>
          <Title level={5}>Upload CSV file</Title>
          <Button icon="Upload" iconPlacement="right" type="primary">
            Add data
          </Button>
        </Box>
        <a
          style={{ color: Colors['text-primary'].hex() }}
          href="https://docs.cognite.com/api/v1/#operation/postRows"
          target="_blank"
        >
          <Box>
            <p className="text-icon">
              <Icon size={40} type="Code" />
            </p>
            <Title level={5}>
              <Flex alignItems="center" justifyContent="center">
                <span style={{ marginRight: '8px' }}>Write data using API</span>
                <Icon type="ExternalLink" />
              </Flex>
            </Title>
            <p style={{ color: Colors['text-secondary'].hex(), margin: 0 }}>
              Learn how to write data to a RAW table here
            </p>
          </Box>
        </a>
      </Flex>
    </EmptyTable>
  );
};

const fakeTableColor = `${Colors['greyscale-grey4'].hex()}33`;

const EmptyTable = styled.div`
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
  color: ${Colors['text-secondary'].hex()};
  text-align: center;
  margin-top: -100px;
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
