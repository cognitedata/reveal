import React, { useState } from 'react';

import { Menu as AntMenu } from 'antd';
import { Icon } from '@cognite/cogs.js';

import styled from 'styled-components';

import { useTableData } from 'hooks/table-data';
import DeleteTableModal from 'components/DeleteTableModal/DeleteTableModal';
import DownloadTableModal from 'components/DownloadTableModal/DownloadTableModal';
import { useActiveTableContext } from 'contexts';
import { useTranslation } from 'common/i18n';
import { ItemType } from 'antd/lib/menu/hooks/useItems';

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
      type: 'group',
      label: t('spreadsheet-menu-danger-zone'),
      children: [
        {
          key: 'delete',
          icon: <Icon type="Delete" />,
          label: t('spreadsheet-menu-delete-table'),
          danger: true,
          onClick: () => setIsDeleteModalOpen(true),
        },
      ],
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
