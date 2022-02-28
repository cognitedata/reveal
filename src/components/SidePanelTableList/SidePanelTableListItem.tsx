import React, { MouseEvent, useState } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Body, Button, Colors, Icon, Menu } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';

import DeleteTableModal from 'components/DeleteTableModal/DeleteTableModal';
import Dropdown from 'components/Dropdown/Dropdown';
import Tooltip from 'components/Tooltip/Tooltip';
import { useActiveTable } from 'hooks/table-tabs';

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

  const [[, activeTableName] = [], setTable] = useActiveTable();
  const isSelected = activeTableName === tableName;

  const { data: hasWriteAccess } = usePermissions(
    getFlow().flow,
    'rawAcl',
    'WRITE'
  );

  const handleDatabaseListItemClick = (): void => {
    setTable([databaseName, tableName]);
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
                icon="Delete"
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
          icon="EllipsisHorizontal"
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
