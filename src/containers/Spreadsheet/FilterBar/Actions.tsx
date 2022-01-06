import React, { useState } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Button, Flex } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';

import AccessButton from 'components/AccessButton';
import Dropdown from 'components/Dropdown/Dropdown';
import UploadCSV from 'components/UploadCSV';
import { useActiveTableContext } from 'contexts';
import { rowKey } from 'hooks/sdk-queries';

import { Menu } from './Menu';

export const Actions = (): JSX.Element => {
  const queryClient = useQueryClient();
  const { data: hasWriteAccess } = usePermissions(
    getFlow().flow,
    'rawAcl',
    'WRITE'
  );
  const { database, table } = useActiveTableContext();
  const [csvModalVisible, setCSVModalVisible] = useState<boolean>(false);

  return (
    <Bar alignItems="center" justifyContent="space-between">
      <AccessButton
        permissions={[{ acl: 'rawAcl', actions: ['WRITE'] }]}
        hasWriteAccess={hasWriteAccess}
        onClick={() => setCSVModalVisible(true)}
      >
        Add new data
      </AccessButton>
      <Dropdown content={<Menu />}>
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
