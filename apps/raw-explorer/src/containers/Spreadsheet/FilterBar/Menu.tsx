import React, { useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import DeleteTableModal from '@raw-explorer/components/DeleteTableModal/DeleteTableModal';
import DownloadTableModal from '@raw-explorer/components/DownloadTableModal/DownloadTableModal';
import { useActiveTableContext } from '@raw-explorer/contexts';
import { useTableData } from '@raw-explorer/hooks/table-data';
import { Menu as AntMenu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';

import { Icon } from '@cognite/cogs.js';

export const Menu = (): JSX.Element => {
  const { t } = useTranslation();
  const { rows, isFetched } = useTableData();
  const { database, table } = useActiveTableContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const canBeDownloaded = isFetched && !!rows?.length;

  const items: ItemType[] = [
    {
      key: 'download',
      label: t('spreadsheet-menu-download-table'),
      icon: <Icon type="Download" />,
      disabled: !canBeDownloaded,
      onClick: () => setIsDownloadModalOpen(true),
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <Icon type="Delete" />,
      label: t('spreadsheet-menu-delete-table'),
      danger: true,
      onClick: () => setIsDeleteModalOpen(true),
    },
  ];

  return (
    <>
      <StyledMenu items={items} />
      <DownloadTableModal
        databaseName={database}
        tableName={table}
        visible={isDownloadModalOpen}
        onCancel={() => setIsDownloadModalOpen(false)}
      />
      <DeleteTableModal
        databaseName={database}
        tableName={table}
        visible={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

const StyledMenu = styled(AntMenu)`
  width: 250px;
  a {
    color: inherit;
  }
  border-radius: 8px;
`;
