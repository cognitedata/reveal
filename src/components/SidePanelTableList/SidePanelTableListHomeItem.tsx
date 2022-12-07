import React, { useContext, useState } from 'react';

import { Body, Button, Colors, Icon, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';

import { RawExplorerContext } from 'contexts';
import DeleteDatabaseModal from 'components/DeleteDatabaseModal/DeleteDatabaseModal';
import Dropdown from 'components/Dropdown/Dropdown';
import Tooltip from 'components/Tooltip/Tooltip';
import { useTranslation } from 'common/i18n';

type SidePanelTableListHomeItemProps = {
  isEmpty?: boolean;
};

const StyledPanelTableListHomeItemWrapper = styled.div`
  border-bottom: 1px solid ${Colors['border-default']};
  margin-bottom: 8px;
  padding-bottom: 8px;
`;

const StyledHomeItem = styled.div`
  align-items: center;
  background-color: ${Colors['bg-accent']};
  border-radius: 6px;
  display: flex;
  height: 40px;
  padding: 0 8px;
  width: 100%;
`;

const StyledHomeIcon = styled(Icon)`
  color: ${Colors['bg-status-small--accent-pressed']};
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
                  type="ghost-danger"
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
