import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Notification } from '@platypus-app/components/Notification/Notification';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components/macro';

import sdk from '@cognite/cdf-sdk-singleton';
import {
  Body,
  Button,
  Chip,
  Divider,
  Dropdown,
  Flex,
  Icon,
  Input,
  Menu,
  Modal,
  Select,
  Table,
  Title,
} from '@cognite/cogs.js';

import { getContainer } from '../../GlobalStyles';
import { devices } from '../common/data';
import { Module } from '../common/types';

export const IoTPage = () => {
  const { id } = useParams();
  const [isCreateVisible, setIsCreateVisible] = useState<boolean>(false);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newKey, setNewKey] = useState<string>('');
  const [secrets, setSecrets] = useState<{
    [key in string]: string;
  }>({ CLIENT_ID: '', CLIENT_SECRET: '' });

  const { data: extractors = [] } = useExtractors();

  const [device, setDevice] = useState(devices.find((el) => el.id === id)!);
  if (!device || !id) {
    return (
      <Wrapper alignItems="center" justifyContent="center">
        <Icon type="Loader" />
      </Wrapper>
    );
  }
  return (
    <Wrapper direction="column">
      <Flex
        className="header"
        gap={12}
        alignItems="center"
        style={{ background: '#fff', padding: 10 }}
      >
        <Button icon="ArrowLeft" onClick={() => window.history.back()} />
        <Title level={5}>{device?.name}</Title>
        <Chip size="x-small" label={device?.id} />
        <div style={{ flex: 1 }} />
        <Button icon="Link" aria-label="menu">
          Documentation
        </Button>
        <Button icon="Code" aria-label="menu">
          Code
        </Button>
        <Divider direction="vertical" />
        <Button icon="EllipsisVertical" aria-label="menu" />
      </Flex>
      <Flex alignItems="center" gap={16} style={{ padding: 16, flex: 1 }}>
        <Flex
          direction="column"
          className="grid-item"
          style={{
            background: 'white',
            height: '100%',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          <Flex
            direction="row"
            alignItems="center"
            style={{ padding: '12px 16px' }}
          >
            <Title level={5}>Modules</Title>
            <div style={{ flex: 1 }} />
            <Dropdown
              hideOnClick
              appendTo="parent"
              content={
                <Menu>
                  <Menu.Item
                    icon="Upload"
                    iconPlacement="left"
                    onClick={() => setIsCreateVisible(true)}
                  >
                    Extractor
                  </Menu.Item>
                  <Menu.Item icon="CodeBraces" iconPlacement="left">
                    Custom
                  </Menu.Item>
                </Menu>
              }
            >
              <Button
                type="primary"
                data-cy="load-btn"
                onClick={console.log}
                icon="Add"
              >
                Add Module
              </Button>
            </Dropdown>
          </Flex>
          <Divider />
          <Flex style={{ flex: 1, overflow: 'auto' }} alignItems="start">
            <Table<Module>
              columns={[
                {
                  Header: () => <Body level={2}>Name</Body>,
                  id: 'name',
                  accessor: 'name',
                },
                {
                  Header: () => <Body level={2}>Type</Body>,
                  id: 'type',
                  accessor: 'type',
                },
                {
                  Header: () => <Body level={2}>Is Deployed</Body>,
                  id: 'deployed',
                  accessor: 'deployed',
                  Cell: ({ cell }) => {
                    return cell?.value ? (
                      <Icon type="Checkmark" />
                    ) : (
                      <Icon type="CloseLarge" />
                    );
                  },
                },
                {
                  Header: () => <Body level={2}>Has Reported Data</Body>,
                  id: 'modules',
                  accessor: 'reported',
                  Cell: ({ cell }) => {
                    return cell?.value ? (
                      <Icon type="Checkmark" />
                    ) : (
                      <Icon type="CloseLarge" />
                    );
                  },
                },
                {
                  Header: () => <Body level={2}>Status</Body>,
                  id: 'active',
                  accessor: 'status',
                  Cell: ({ cell }) => {
                    return cell?.value ? (
                      <Icon type="Checkmark" />
                    ) : (
                      <Icon type="CloseLarge" />
                    );
                  },
                },
                {
                  Header: () => <Body level={2}></Body>,
                  id: 'actions',
                  accessor: 'type',
                  Cell: ({ cell }) =>
                    cell.value === 'extractor' ? (
                      <Button
                        type="secondary"
                        icon="ExternalLink"
                        iconPlacement="right"
                        onClick={() => {
                          const newUrl = window.location.href;
                          window.open(
                            newUrl.replaceAll('/iot', '/extpipes/extpipe'),
                            '_blank'
                          );
                        }}
                      >
                        View Extractor
                      </Button>
                    ) : (
                      <></>
                    ),
                },
              ]}
              dataSource={device?.modules || []}
              pagination={false}
            />
          </Flex>
        </Flex>
        <Flex
          direction="column"
          className="grid-item"
          style={{
            background: 'white',
            height: '100%',
            overflow: 'hidden',
            width: 320,
          }}
        >
          <Flex
            direction="row"
            alignItems="center"
            style={{ padding: '12px 16px' }}
          >
            <Title level={5}>Details</Title>
            <div style={{ flex: 1 }} />
            <Button
              type="ghost"
              data-cy="load-btn"
              onClick={console.log}
              icon="Edit"
              aria-label="Edit"
            />
          </Flex>
          <Divider />
          <Flex style={{ padding: '16px' }} direction="column" gap={16}>
            {Object.entries(device).map(([key, value]) =>
              typeof value !== 'object' ? (
                <Flex key={key}>
                  <Body level={3}>{key}</Body>
                  <Body level={3} style={{ textAlign: 'end', flex: 1 }}>
                    {value}
                  </Body>
                </Flex>
              ) : null
            )}
          </Flex>
        </Flex>
      </Flex>
      <Modal
        visible={isCreateVisible}
        title="Create new module"
        onCancel={() => setIsCreateVisible(false)}
        okDisabled={
          Object.values(secrets).some((el) => !el || el.trim() === '') ||
          !newName
        }
        onOk={() => {
          setTimeout(() => {
            Notification({
              type: 'success',
              message: 'Successfully added new module',
            });
            setIsCreateVisible(false);
            setDevice((currDevice) => ({
              ...currDevice,
              modules: [
                ...currDevice.modules,
                {
                  name: newName!,
                  type: 'extractor',
                  deployed: true,
                  reported: false,
                  status: false,
                },
              ],
            }));
          }, 300);
        }}
      >
        <Flex direction="column" gap={8}>
          <Body level={5} strong>
            Name
          </Body>
          <Input
            label="Name"
            headers="Name"
            value={newName}
            onChange={(ev) => setNewName(ev.target.value)}
          />
          <Body style={{ marginTop: 16 }} level={5} strong>
            Select type of extractor
          </Body>
          <Select
            menuPortalTarget={getContainer()}
            value={
              selectedPipeline
                ? { label: selectedPipeline, value: selectedPipeline }
                : undefined
            }
            onChange={(selected: { value: string }) =>
              setSelectedPipeline(selected.value)
            }
            options={extractors.map((el) => ({
              label: el.name,
              value: el.name,
            }))}
          />
          <Divider style={{ marginTop: 16 }} />
          <Body level={5} strong>
            Configuration (Enviornment Variables)
          </Body>
          <Flex direction="column" gap={4}>
            {Object.entries(secrets).map(([key, value]) =>
              typeof value !== 'object' ? (
                <Flex key={key} alignItems="center">
                  <Body level={3} muted style={{ flex: 1 }}>
                    {key}
                  </Body>
                  <Flex style={{ flex: 1 }}>
                    <Input
                      fullWidth
                      value={value}
                      type={key.includes('SECRET') ? 'password' : 'text'}
                      onChange={(ev) =>
                        setSecrets((currValue) => ({
                          ...currValue,
                          [key]: ev.target.value,
                        }))
                      }
                    />
                  </Flex>
                </Flex>
              ) : null
            )}
            <Flex>
              <Flex style={{ flex: 1 }} gap={6}>
                <Flex style={{ flex: 1 }}>
                  <Input
                    fullWidth
                    placeholder="New key"
                    value={newKey}
                    onChange={(ev) => setNewKey(ev.target.value)}
                  />
                </Flex>
                <Button
                  disabled={!newKey}
                  onClick={() => {
                    setSecrets((currValue) => ({
                      ...currValue,
                      [newKey]: '',
                    }));
                    setNewKey('');
                  }}
                >
                  Add
                </Button>
              </Flex>
              <Flex style={{ flex: 1 }}></Flex>
            </Flex>
          </Flex>
        </Flex>
      </Modal>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  background: rgb(245, 245, 245);
  flex: 1;

  .grid-item,
  .header {
    box-shadow: rgba(79, 82, 104, 0.04) 0px 1px 2px 1px,
      rgba(79, 82, 104, 0.06) 0px 1px 1px 1px;
  }
`;

const useExtractors = () =>
  useQuery(['listExtractors'], async () => {
    const { data } = await sdk.get<{ items: { name: string }[] }>(
      `/api/playground/projects/${sdk.project}/extractors/`
    );
    return data.items;
  });
