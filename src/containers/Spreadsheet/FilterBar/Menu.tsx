import React, { useState } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Button, Icon, Menu as CogsMenu } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';

import { useTableData } from 'hooks/table-data';
import DeleteTableModal from 'components/DeleteTableModal/DeleteTableModal';
import DownloadTableModal from 'components/DownloadTableModal/DownloadTableModal';
import { useActiveTableContext } from 'contexts';
import { useTranslation } from 'common/i18n';

export const Menu = (): JSX.Element => {
  const { t } = useTranslation();
  const { flow } = getFlow();
  const { data: hasWriteAccess } = usePermissions(flow, 'rawAcl', 'WRITE');
  const { rows, isFetched } = useTableData();
  const { database, table } = useActiveTableContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const canBeDownloaded = isFetched && !!rows?.length;

  const stopPropagation = (
    e: React.MouseEvent<HTMLButtonElement | HTMLElement>
  ) => e.stopPropagation();

  return (
    <StyledMenu>
      <CogsMenu.Item
        aria-label={`Button ${t(
          'spreadsheet-menu-download-table'
        ).toLowerCase()}`}
        disabled={!canBeDownloaded}
        onClick={() => setIsDownloadModalOpen(true)}
      >
        <Item>
          <Icon type="Download" />
          {t('spreadsheet-menu-download-table')}
        </Item>
      </CogsMenu.Item>
      <DownloadTableModal
        databaseName={database}
        tableName={table}
        visible={isDownloadModalOpen}
        onCancel={() => setIsDownloadModalOpen(false)}
      />
      <CogsMenu.Divider />
      <CogsMenu.Header>{t('spreadsheet-menu-danger-zone')}</CogsMenu.Header>
      <CogsMenu.Item
        aria-label={`Button ${t('spreadsheet-menu-delete-table')}`}
        disabled={!hasWriteAccess}
        onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
          stopPropagation(e);
          setIsDeleteModalOpen(true);
        }}
      >
        <DeleteButton type="ghost-danger" tabIndex={-1}>
          <Icon type="Delete" />
          <span>{t('spreadsheet-menu-delete-table')}</span>
        </DeleteButton>
      </CogsMenu.Item>
      <DeleteTableModal
        databaseName={database}
        tableName={table}
        visible={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </StyledMenu>
  );
};

const StyledMenu = styled(CogsMenu)`
  width: 250px;
  a {
    color: inherit;
  }
`;
const DeleteButton = styled(Button)`
  flex-grow: 1;
  margin: -8px;
  height: 34px;
  justify-content: flex-start;
`;
const Item = styled.span<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 500;
`;
