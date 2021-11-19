import React, { useEffect, useState } from 'react';
import { Button, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { useActiveTable } from 'hooks/table-tabs';
import AccessButton from 'components/AccessButton';
import Dropdown from 'components/Dropdown/Dropdown';
import UploadCSV from 'components/UploadCSV';
import { Menu } from './Menu';
import { useQueryClient } from 'react-query';
import { rowKey } from 'hooks/sdk-queries';

export const Actions = (): JSX.Element => {
  const queryClient = useQueryClient();
  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const [[database, table] = []] = useActiveTable();
  const [csvModalVisible, setCSVModalVisible] = useState<boolean>(false);

  useEffect(() => {
    // invalidate rows/profile when closing the modal
    if (database && table && !csvModalVisible) {
      queryClient.invalidateQueries(rowKey(database, table, 0).slice(0, 3));
    }
  }, [csvModalVisible, database, table]);

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
        <Button icon="HorizontalEllipsis" type="secondary" />
      </Dropdown>
      {csvModalVisible && (
        <UploadCSV
          setCSVModalVisible={setCSVModalVisible}
          table={table!}
          database={database!}
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
