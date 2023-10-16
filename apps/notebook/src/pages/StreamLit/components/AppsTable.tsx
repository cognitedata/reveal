import { useMemo, useState } from 'react';

import styled from 'styled-components';

import sdk from '@cognite/cdf-sdk-singleton';
import {
  Button,
  Modal,
  Flex,
  Chip,
  Table,
  Tooltip,
  Illustrations,
  Body,
} from '@cognite/cogs.js';

import { sleep } from '../common';
import { SteamLitAppSpecNoContent } from '../types';

export interface AppsTableProps {
  apps: SteamLitAppSpecNoContent[];
  onAppSelected: (appId: string) => void;
  onAppDeleted: (appId: string) => void;
}

export const AppsTable = (props: AppsTableProps) => {
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);

  const dataSource = useMemo(
    () =>
      props.apps.map((app) => ({
        key: app.fileExternalId,
        name: app.name,
        description: app.description,
        creator: app.creator,
        appId: app.fileExternalId,
        published: app.published,
        createdAt: app.createdAt,
      })),
    [props.apps]
  );

  dataSource.sort((a, b) => {
    return a.createdAt > b.createdAt ? -1 : 1;
  });

  return (
    <Wrapper direction="column">
      <Table<(typeof dataSource)[0]>
        onRow={(record) => {
          return {
            onClick: () => {
              const selectedAppId = record.key;
              props.onAppSelected(selectedAppId);
            },
          };
        }}
        dataSource={dataSource}
        columns={[
          {
            Header: 'Name',
            accessor: (data) => (
              <Flex
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                {data.name}
                <Chip
                  size="small"
                  type={data.published ? 'neutral' : 'default'}
                  label={data.published ? 'Published' : 'Draft'}
                />
              </Flex>
            ),
            id: 'name',
          },
          {
            Header: 'Description',
            accessor: (data) => {
              if (data['description'].length > 40) {
                return (
                  <Tooltip content={data['description']}>
                    <span title={data['description']}>
                      {data['description'].substring(0, 40) + '...'}
                    </span>
                  </Tooltip>
                );
              } else {
                return data['description'];
              }
            },
            id: 'description',
          },
          {
            Header: 'Created at',
            accessor: (data) =>
              data['createdAt'].toDateString() +
              ' ' +
              data['createdAt'].toLocaleTimeString(),
            id: 'createdat',
          },
          {
            Header: 'Creator',
            accessor: (data) => data['creator'],
            id: 'creator',
          },
          {
            Header: 'Delete',
            id: 'delete',
            accessor: (record: any) => (
              <Button
                id="delete-button"
                icon="Delete"
                type="ghost-destructive"
                onClick={(e) => {
                  setDeleteAppId(record.appId);
                  e.stopPropagation();
                }}
              />
            ),
          },
        ]}
        locale={{
          emptyText: (
            <Flex
              alignItems="center"
              justifyContent="center"
              gap={16}
              direction="column"
              style={{ padding: 24 }}
            >
              <Illustrations.Solo type="EmptyStateFile" prominence="muted" />
              <Body>
                No apps yet, click &quot;Create app&quot; to get started
              </Body>
            </Flex>
          ),
        }}
      />
      {deleteAppId && (
        <Modal
          title="Delete App"
          visible={deleteAppId !== null}
          onOk={async () => {
            await sdk.files.delete([{ externalId: deleteAppId }]);
            await sleep(500);
            props.onAppDeleted(deleteAppId);
            setDeleteAppId(null);
          }}
          onCancel={() => {
            setDeleteAppId(null);
          }}
        >
          <p>Are you sure you want to delete this app?</p>
        </Modal>
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  .cogs-table-row {
    cursor: pointer;
  }
  #delete-button {
    opacity: 0;
    transition: 0.3s all;
  }
  .cogs-table-row:hover #delete-button {
    opacity: 1;
  }
`;
