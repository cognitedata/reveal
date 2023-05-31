import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import moment from 'moment';
import styled from 'styled-components/macro';
import { useDebounce } from 'use-debounce';

import { Body, Button, Flex, Input, Table, Title } from '@cognite/cogs.js';

import { devices } from '../common/data';
import { IoTDevice } from '../common/types';

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const visibleDevices = useMemo(
    () =>
      devices.filter((el) =>
        el.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ),
    [debouncedSearchTerm]
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
          type="primary"
          data-cy="load-btn"
          onClick={console.log}
          icon="Add"
        >
          Add IoT Device
        </Button>
      </Flex>
      <Table<IoTDevice>
        columns={[
          {
            Header: () => <Body level={2}>Name</Body>,
            id: 'name',
            accessor: 'name',
          },
          {
            Header: () => <Body level={2}>Latest Response</Body>,
            id: 'latest',
            accessor: 'latestResponse',
            Cell: ({ cell }) => (
              <Body level={3}>{moment(cell.value).fromNow()}</Body>
            ),
          },
          {
            Header: () => <Body level={2}>Modules</Body>,
            id: 'modules',
            accessor: 'modules',
            Cell: ({ cell }) => (
              <Body level={3}>{cell.value.length} modules</Body>
            ),
          },
        ]}
        pagination={false}
        onRowClick={(row) => navigate(`/${row.original.id}`)}
        dataSource={visibleDevices}
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
