import React, { useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { CSVLink } from 'react-csv';

import { Colors, Icon, Menu as CogsMenu } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';

import styled from 'styled-components';
import notification from 'antd/lib/notification';
import Popconfirm from 'antd/lib/popconfirm';

import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { useDeleteTable } from 'hooks/sdk-queries';
import { useActiveTable } from 'hooks/table-tabs';
import { useTableData } from 'hooks/table-data';
import { escapeCSVValue } from 'utils/utils';

export const Menu = (): JSX.Element => {
  const history = useHistory();
  const { appPath } = useParams<{
    appPath: string;
  }>();
  const { mutate: deleteTable } = useDeleteTable();
  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const { rows, isDone } = useTableData();
  const [[database, table] = [undefined, undefined]] = useActiveTable();

  const canBeDownloaded = isDone && !!rows?.length;
  const canBeRenamed = false; // TODO

  const onDownloadData = useMemo(() => {
    return (
      rows.map((item) => {
        const escapedColumns: Record<string, string> = {};
        Object.keys(item).forEach((key) => {
          escapedColumns[key] = escapeCSVValue(item[key]);
        });
        delete escapedColumns['column-index'];
        return { key: item.key, ...escapedColumns };
      }) || []
    );
  }, [rows]);

  return (
    <StyledMenu>
      <CogsMenu.Item aria-label="Button rename table" disabled={!canBeRenamed}>
        <Item>
          <Icon type="Edit" />
          Rename table
        </Item>
      </CogsMenu.Item>
      <CSVLink
        filename={`cognite-${database}-${table}.csv`}
        data={onDownloadData}
      >
        <CogsMenu.Item
          aria-label="Button download table"
          disabled={!canBeDownloaded}
        >
          <Item>
            <Icon type="Download" />
            Download table
          </Item>
        </CogsMenu.Item>
      </CSVLink>
      <CogsMenu.Divider />
      <CogsMenu.Header>Danger zone</CogsMenu.Header>
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
        <CogsMenu.Item
          aria-label="Button delete table"
          disabled={!hasWriteAccess}
        >
          <Item>
            <Icon type="Trash" />
            <span style={{ color: Colors['text-danger'].hex() }}>
              Delete table
            </span>
          </Item>
        </CogsMenu.Item>
      </Popconfirm>
    </StyledMenu>
  );
};

const StyledMenu = styled(CogsMenu)`
  width: 250px;
  a {
    color: inherit;
  }
`;
const Item = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 500;
`;
