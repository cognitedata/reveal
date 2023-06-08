import React, { useContext, useState } from 'react';
import { ColumnShape } from 'react-base-table';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import ColumnIcon, {
  COLUMN_ICON_WIDTH,
} from '@raw-explorer/components/ColumnIcon';
import Tooltip from '@raw-explorer/components/Tooltip/Tooltip';
import UploadCSV from '@raw-explorer/components/UploadCSV';
import {
  RawExplorerContext,
  useActiveTableContext,
  useProfilingSidebar,
} from '@raw-explorer/contexts';
import { rowKey } from '@raw-explorer/hooks/sdk-queries';
import { useQueryClient } from '@tanstack/react-query';

import { Body, Button, Colors, Flex, Icon, Title } from '@cognite/cogs.js';

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
  margin-bottom: 0px;
`;

const StyledIcon = styled(Icon).attrs({
  size: 40,
})`
  color: ${Colors['border--muted']};
`;

const Box = styled.div`
  width: 280px;
  padding: 28px;
  margin: 20px;
  border: 1px solid ${Colors['border--muted']};
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  .cogs-title-5 {
    margin-bottom: 16px;
  }
  .text-icon {
    color: ${Colors['text-icon--muted']};
    min-height: 50px;
  }
  &:hover {
    background-color: ${Colors['border--interactive--toggled-pressed']};
    border-color: ${Colors['border--interactive--hover']};
    ${StyledIcon} {
      color: ${Colors['border--interactive--hover']};
    }
  }
`;

export const EmptyRender = (): JSX.Element => {
  const { t } = useTranslation();
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
        {t('spreadsheet-table-empty-text')}
      </EmptyTableText>
      <Flex wrap="wrap" justifyContent="center">
        <Box onClick={() => setCSVModalVisible(true)}>
          <p style={{ height: 50 }}>
            <StyledIcon type="Document" />
          </p>
          <Title level={5}>
            {t('spreadsheet-table-empty-button-upload-file')}
          </Title>
          <Button icon="Upload" iconPlacement="right" type="primary">
            {t('spreadsheet-table-empty-button-add-data')}
          </Button>
        </Box>
        <a
          style={{ color: Colors['text-icon--strong'] }}
          href="https://docs.cognite.com/api/v1/#operation/postRows"
          target="_blank"
          rel="noreferrer"
        >
          <Box>
            <p className="text-icon">
              <StyledIcon type="Code" />
            </p>
            <Title level={5}>
              <Flex alignItems="center" justifyContent="center">
                <span style={{ marginRight: '8px' }}>
                  {t('spreadsheet-table-empty-button-write-data')}
                </span>
                <Icon type="ExternalLink" />
              </Flex>
            </Title>
            <p style={{ color: Colors['text-icon--medium'], margin: 0 }}>
              {t('spreadsheet-table-empty-button-write-data-learn')}
            </p>
          </Box>
        </a>
      </Flex>
    </EmptyTable>
  );
};

const fakeTableColor = `${Colors['text-icon--muted']}33`;

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
  color: ${Colors['text-icon--medium']};
  text-align: center;
  margin-top: -100px;
`;

const HeaderCell = styled(Body).attrs(
  ({ $isSelected }: { $isSelected: boolean }) => {
    if ($isSelected) return { style: { backgroundColor: '#F2F2F5' } };
    return {};
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
