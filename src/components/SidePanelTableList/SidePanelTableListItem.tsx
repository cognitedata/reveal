import React, { MouseEvent, useState } from 'react';

import {
  Body,
  Button,
  Colors,
  Dropdown,
  Icon,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import DeleteTableModal from 'components/DeleteTableModal/DeleteTableModal';
import { useActiveTable, useOpenTable } from 'hooks/table-tabs';
import { useUserCapabilities } from 'hooks/useUserCapabilities';

type SidePanelTableListItemProps = {
  databaseName: string;
  tableName: string;
};

const StyledTableListDropdownButton = styled(Button)<{ $isSelected: boolean }>`
  transition: visibility 0s;
  visibility: ${({ $isSelected }) => ($isSelected ? 'visible' : 'hidden')};
`;

const StyledSidePanelTableListItemWrapper = styled.button<{
  $isSelected?: boolean;
}>`
  align-items: center;
  background-color: ${({ $isSelected }) =>
    $isSelected ? Colors['bg-selected'] : Colors['bg-accent']};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  height: 40px;
  margin-bottom: 8px;
  padding: 0 8px;
  width: 100%;

  &:hover {
    background-color: ${({ $isSelected }) =>
      $isSelected ? Colors['bg-selected'] : Colors['bg-hover']};

    ${StyledTableListDropdownButton} {
      visibility: visible;
    }
  }

  &:active {
    background-color: ${Colors['bg-selected']};
  }
`;

const StyledTableIcon = styled(Icon)`
  color: ${Colors['green-2']};
  margin-right: 8px;
`;

const StyledItemName = styled(Body)`
  margin-right: 8px;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 60px);
`;

const SidePanelTableListItem = ({
  databaseName,
  tableName,
}: SidePanelTableListItemProps): JSX.Element => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openTable = useOpenTable();
  const [activeTable] = useActiveTable();
  const [_, activeTableName] = activeTable || [];
  const isSelected = activeTableName === tableName;

  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');

  const handleDatabaseListItemClick = (): void => {
    openTable([databaseName, tableName]);
  };

  const stopPropagation = (e: MouseEvent<HTMLButtonElement | HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <StyledSidePanelTableListItemWrapper
      $isSelected={isSelected}
      onClick={handleDatabaseListItemClick}
    >
      <StyledTableIcon type="DataTable" />
      <StyledItemName level={3}>
        <Tooltip content={tableName}>
          <>{tableName}</>
        </Tooltip>
      </StyledItemName>
      <Dropdown
        content={
          <Menu>
            <Tooltip
              content={
                <>
                  To delete tables, you need to have the{' '}
                  <strong>raw:write</strong> capability
                </>
              }
              disabled={hasWriteAccess}
            >
              <Button
                disabled={!hasWriteAccess}
                icon="Trash"
                onClick={(e) => {
                  stopPropagation(e);
                  setIsDeleteModalOpen(true);
                }}
                type="ghost-danger"
              >
                Delete table
              </Button>
            </Tooltip>
          </Menu>
        }
      >
        <StyledTableListDropdownButton
          $isSelected={isSelected}
          icon="MoreOverflowEllipsisHorizontal"
          onClick={stopPropagation}
          size="small"
          type="ghost"
        />
      </Dropdown>
      <DeleteTableModal
        databaseName={databaseName}
        onCancel={() => setIsDeleteModalOpen(false)}
        tableName={tableName}
        visible={isDeleteModalOpen}
      />
    </StyledSidePanelTableListItemWrapper>
  );
};

export default SidePanelTableListItem;
