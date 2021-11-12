import React, { useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { Button, Colors, Dropdown, Flex } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import notification from 'antd/lib/notification';
import Popconfirm from 'antd/lib/popconfirm';
import styled from 'styled-components';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { useDeleteTable } from 'hooks/sdk-queries';
import { useActiveTable } from 'hooks/table-tabs';
import AccessButton from 'components/AccessButton';
import DropdownMenu from 'components/DropdownMenu';
import MenuButton from 'components/MenuButton';
import UploadCSV from 'components/UploadCSV';

export const Menu = (): JSX.Element => {
  const history = useHistory();
  const { appPath } = useParams<{
    appPath: string;
  }>();
  const { mutate: deleteTable } = useDeleteTable();
  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const [[database, table] = [undefined, undefined]] = useActiveTable();

  const [csvModalVisible, setCSVModalVisible] = useState<boolean>(false);

  const onFiltersClick = () => {
    /** do something */
  };
  const onExpandClick = () => {
    /** do something */
  };
  const onDownloadData = useMemo(() => {
    /** do something */
    return [];
  }, []);

  return (
    <Bar alignItems="center" justifyContent="space-between">
      <Button
        icon="Filter"
        size="small"
        variant="ghost"
        onClick={onFiltersClick}
      >
        Filters
      </Button>
      <Button
        icon="ExpandMax"
        size="small"
        variant="ghost"
        onClick={onExpandClick}
      />
      <Dropdown
        content={
          <DropdownMenu>
            <AccessButton
              permissions={[{ acl: 'rawAcl', actions: ['WRITE'] }]}
              hasWriteAccess={hasWriteAccess}
              onClick={() => setCSVModalVisible(true)}
            >
              Upload CSV
            </AccessButton>
            <Popconfirm
              title="Are you sure you want to delete this table? Once deleted, the table cannot be recovered."
              onConfirm={() =>
                deleteTable(
                  { database: database!, table: table! },
                  {
                    onSuccess() {
                      notification.success({
                        message: `Table ${table} in database ${database} deleted!`,
                        key: 'table-created',
                      });
                      history.replace(createLink(`/${appPath}/${database}`));
                    },
                    onError(e) {
                      notification.error({
                        message: 'An error occured when deleting the table!',
                        description: <pre>{JSON.stringify(e, null, 2)}</pre>,
                        key: 'table-created',
                      });
                    },
                  }
                )
              }
              okText="Yes"
              cancelText="No"
              disabled={!hasWriteAccess}
              cancelButtonProps={{ type: 'default' }}
            >
              <MenuButton
                type="ghost-danger"
                aria-label="Button delete table"
                icon="Trash"
                disabled={!hasWriteAccess}
              >
                Delete Table
              </MenuButton>
            </Popconfirm>
            <CSVLink
              filename={`cognite-${database}-${table}.csv`}
              data={onDownloadData}
            >
              <MenuButton
                type="ghost"
                aria-label="Button download table"
                icon="Download"
              >
                Download CSV
              </MenuButton>
            </CSVLink>
          </DropdownMenu>
        }
      >
        <Button icon="HorizontalEllipsis" size="small" variant="ghost" />
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
  border-left: 1px solid ${Colors['greyscale-grey3'].hex()};
  & > * {
    margin: 0 4px;
  }
`;
