import React, { useContext, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import DeleteDatabaseModal from '@raw-explorer/components/DeleteDatabaseModal/DeleteDatabaseModal';
import Dropdown from '@raw-explorer/components/Dropdown/Dropdown';
import Tooltip from '@raw-explorer/components/Tooltip/Tooltip';
import { RawExplorerContext } from '@raw-explorer/contexts';

import { Body, Button, Colors, Icon, Menu } from '@cognite/cogs.js';

type SidePanelTableListHomeItemProps = {
  isEmpty?: boolean;
};

const StyledPanelTableListHomeItemWrapper = styled.div`
  border-bottom: 1px solid ${Colors['border--interactive--default']};
  margin-bottom: 8px;
  padding-bottom: 8px;
`;

const StyledHomeItem = styled.div`
  align-items: center;
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  display: flex;
  height: 40px;
  padding: 0 8px;
  width: 100%;
`;

const StyledHomeIcon = styled(Icon)`
  color: ${Colors['text-icon--interactive--default']};
  margin-right: 8px;
`;

const StyledHomeItemName = styled(Body)`
  margin-right: 8px;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 60px);
`;

const SidePanelTableListHomeItem = ({
  isEmpty,
}: SidePanelTableListHomeItemProps): JSX.Element => {
  const { t } = useTranslation();
  const { selectedSidePanelDatabase = '' } = useContext(RawExplorerContext);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <StyledPanelTableListHomeItemWrapper>
      <StyledHomeItem>
        <StyledHomeIcon type="Home" />
        <StyledHomeItemName level={3}>
          {selectedSidePanelDatabase}
        </StyledHomeItemName>
        <Dropdown
          content={
            <Menu>
              <Tooltip
                content={t(
                  'explorer-side-panel-databases-delete-warning-non-empty'
                )}
                disabled={isEmpty}
              >
                <Button
                  disabled={!isEmpty}
                  icon="Delete"
                  onClick={() => setIsDeleteModalOpen(true)}
                  type="ghost-destructive"
                >
                  {t('explorer-side-panel-databases-delete-button')}
                </Button>
              </Tooltip>
            </Menu>
          }
        >
          <Button
            aria-label="Options"
            icon="EllipsisHorizontal"
            size="small"
            type="ghost"
          />
        </Dropdown>
        <DeleteDatabaseModal
          databaseName={selectedSidePanelDatabase}
          onCancel={() => setIsDeleteModalOpen(false)}
          visible={isDeleteModalOpen}
        />
      </StyledHomeItem>
    </StyledPanelTableListHomeItemWrapper>
  );
};

export default SidePanelTableListHomeItem;
