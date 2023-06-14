import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components/macro';

import {
  Body,
  Button,
  Chip,
  Divider,
  Dropdown,
  Flex,
  Icon,
  Menu,
  Title,
} from '@cognite/cogs.js';

import { useDeviceModules } from '../../hooks/useDeviceModules';

import { CreateModuleModal } from './components/CreateModuleModal';
import { ModulesTable } from './components/ModulesTable';

export const IoTPage = () => {
  const { id } = useParams() as { id: string };
  const [isCreateVisible, setIsCreateVisible] = useState<boolean>(false);

  const { data = [] } = useDeviceModules(id);

  const device = useMemo(
    () => data.find((el) => el.moduleId === '$edgeAgent'),
    [data]
  );

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
        <Title level={5}>{device?.deviceId}</Title>
        <Chip size="x-small" label={device?.deviceId} />
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
      <Flex
        alignItems="center"
        gap={16}
        style={{ padding: 16, flex: 1, overflow: 'hidden' }}
      >
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
            <ModulesTable id={id} />
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
      <CreateModuleModal
        id={id}
        visible={isCreateVisible}
        onClose={() => {
          setIsCreateVisible(false);
        }}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  background: rgb(245, 245, 245);
  flex: 1;
  overflow: hidden;

  .grid-item,
  .header {
    box-shadow: rgba(79, 82, 104, 0.04) 0px 1px 2px 1px,
      rgba(79, 82, 104, 0.06) 0px 1px 1px 1px;
  }
`;
