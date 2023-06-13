import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import styled from 'styled-components/macro';
import { useDebounce } from 'use-debounce';

import {
  Body,
  Button,
  Flex,
  Icon,
  Illustrations,
  Input,
  Table,
  Title,
} from '@cognite/cogs.js';

import { DeviceOverview, useDevices } from '../hooks/useDevices';

import { ConnectionStringModal } from './ConnectionStringPage';

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const queryClient = useQueryClient();

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { data: devices, isLoading, isError } = useDevices();

  const visibleDevices = useMemo(
    () =>
      devices
        ? devices.filter((el) =>
            el.deviceId
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase())
          )
        : [],
    [devices, debouncedSearchTerm]
  );
  return (
    <Wrapper gap={16} direction="column">
      <Flex alignItems="center">
        <Title level={2} style={{ flex: 1, marginBottom: 16 }}>
          IoT devices
        </Title>
      </Flex>
      <Flex alignItems="center" gap={12}>
        <Input
          placeholder="Search IoT devices..."
          icon="Search"
          value={searchTerm}
          onChange={(ev) => setSearchTerm(ev.target.value || '')}
        />
        <Button icon="Filter" aria-label="Filters" />
        <div style={{ flex: 1 }} />
        <Button
          type="ghost"
          data-cy="load-btn"
          onClick={() => setSettingsOpen(true)}
          icon="Settings"
        />
      </Flex>
      <Table<DeviceOverview>
        columns={[
          {
            Header: () => <Body level={2}>Name</Body>,
            id: 'name',
            accessor: 'deviceId',
          },
          {
            Header: () => <Body level={2}>Status</Body>,
            id: 'modules',
            accessor: 'status',
          },
          {
            Header: () => <Body level={2}>Latest Response</Body>,
            id: 'latest',
            accessor: 'properties',
            Cell: ({ cell }) => (
              <Body level={3}>
                {moment(cell.value.reported.$metadata.$lastUpdated).fromNow()}
              </Body>
            ),
          },
        ]}
        locale={{
          emptyText: isLoading ? (
            <Flex
              style={{ height: '100%', width: '100%' }}
              alignItems="center"
              justifyContent="center"
              gap={8}
              direction="column"
            >
              <Icon type="Loader" size={36} />
              Loading
            </Flex>
          ) : isError ? (
            <Flex
              style={{ height: '100%', width: '100%' }}
              alignItems="center"
              justifyContent="center"
              gap={8}
              direction="column"
            >
              <Illustrations.Solo type="EmptyStateSearchSad" />
              Unable to load data
            </Flex>
          ) : undefined,
        }}
        onRowClick={(row) =>
          navigate(`/${row.original.deviceId}${window.location.search}`)
        }
        dataSource={visibleDevices}
      />
      <ConnectionStringModal
        visible={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          queryClient.invalidateQueries();
          queryClient.clear();
        }}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  padding: 48px;
  tr:hover {
    cursor: pointer;
  }
`;
