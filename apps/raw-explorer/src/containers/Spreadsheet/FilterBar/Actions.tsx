import React, { useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import AccessButton from '@raw-explorer/components/AccessButton';
import UploadCSV from '@raw-explorer/components/UploadCSV';
import { useActiveTableContext } from '@raw-explorer/contexts';
import { rowKey } from '@raw-explorer/hooks/sdk-queries';
import { useQueryClient } from '@tanstack/react-query';
import { Dropdown } from 'antd';

import { Button, Flex } from '@cognite/cogs.js';

import { Menu } from './Menu';

export const Actions = (): JSX.Element => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { database, table } = useActiveTableContext();
  const [csvModalVisible, setCSVModalVisible] = useState<boolean>(false);

  return (
    <Bar alignItems="center" justifyContent="space-between">
      <AccessButton
        hasWriteAccess={true}
        permissions={[{ acl: 'rawAcl', actions: ['WRITE'] }]}
        onClick={() => setCSVModalVisible(true)}
      >
        {t('spreadsheet-filter-add-new-data')}
      </AccessButton>
      <Dropdown overlay={<Menu />} trigger={['click']}>
        <Button
          aria-label="Options"
          icon="EllipsisHorizontal"
          type="secondary"
        />
      </Dropdown>
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
    </Bar>
  );
};

const Bar = styled(Flex)`
  & > * {
    margin: 0 4px;
  }
`;
