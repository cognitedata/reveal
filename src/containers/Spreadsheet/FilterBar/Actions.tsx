import React, { useState } from 'react';
import { Button, Dropdown, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { useActiveTable } from 'hooks/table-tabs';
import AccessButton from 'components/AccessButton';
import UploadCSV from 'components/UploadCSV';
import { Menu } from './Menu';

export const Actions = (): JSX.Element => {
  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const [[database, table] = [undefined, undefined]] = useActiveTable();
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
        <Button icon="HorizontalEllipsis" type="secondary" />
      </Dropdown>
      <UploadCSV
        csvModalVisible={csvModalVisible}
        setCSVModalVisible={setCSVModalVisible}
        table={table!}
        database={database!}
      />
    </Bar>
  );
};

const Bar = styled(Flex)`
  & > * {
    margin: 0 4px;
  }
`;
