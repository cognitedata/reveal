import { Flex, InputExp, Body, IconType, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Drawer, Select } from 'antd';
import { useMemo } from 'react';

import { useTranslation } from 'common';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { useTransformationList } from 'hooks/transformation';
import { useFlowList } from 'hooks/files';
import { useFunctions } from 'hooks/functions';
import { collectPages } from 'utils';
import { ProcessNodeData, ProcessType } from 'types';

const { Option } = Select;

export const NodeConfigurationPanel = (): JSX.Element => {
  const { t } = useTranslation();

  const {
    nodes,
    isNodeConfigurationPanelOpen,
    setIsNodeConfigurationPanelOpen,
    selectedNodeId,
    selectedNodeComponent,
    setSelectedNodeComponent,
    selectedNodeDescription,
    setSelectedNodeDescription,
    selectedNodeItem,
    setSelectedNodeItem,
    changeNodes,
  } = useWorkflowBuilderContext();

  const { data } = useTransformationList();
  const transformationList = useMemo(() => collectPages(data), [data]);

  const { data: flowData } = useFlowList({ staleTime: 0 });

  const { data: functionsData } = useFunctions();

  const onClose = () => {
    setIsNodeConfigurationPanelOpen(false);
  };

  const nodeOptions: {
    value: string;
    label: string;
    icon: IconType;
  }[] = [
    {
      value: 'transformation',
      label: t('transformation'),
      icon: 'Code',
    },
    {
      value: 'function',
      label: t('function'),
      icon: 'Function',
    },
    {
      value: 'webhook',
      label: t('webhook'),
      icon: 'FrameTool',
    },
  ];

  const itemCreateNewOption = () => {
    switch (selectedNodeComponent) {
      case 'transformation': {
        return (
          <Option
            key={'create-new-transformation'}
            value={'Create new transformation'}
          >
            <Body level={2}>{'Create new transformation'}</Body>
          </Option>
        );
      }
      case 'workflow': {
        return (
          <Option key={'create-new-workflow'} value={'Create new workflow'}>
            <Body level={2}>{'Create new workflow'}</Body>
          </Option>
        );
      }
      case 'function': {
        return (
          <Option key={'create-new-function'} value={'Create new function'}>
            <Body level={2}>{'Create new function'}</Body>
          </Option>
        );
      }
      case 'webhook': {
        return (
          <Option key={'create-new-webhook'} value={'Create new webhook'}>
            <Body level={2}>{'Create new webhook'}</Body>
          </Option>
        );
      }
    }
  };

  const itemOptions = () => {
    switch (selectedNodeComponent) {
      case 'transformation': {
        return transformationList
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ externalId, name }) => (
            <Option key={externalId} value={externalId}>
              <Body level={2}>{name}</Body>
            </Option>
          ));
      }
      case 'workflow': {
        if (flowData) {
          return flowData
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(({ externalId, name }) => (
              <Option key={externalId} value={externalId}>
                <Body level={2}>{name}</Body>
              </Option>
            ));
        }
      }
      case 'function': {
        if (functionsData) {
          return functionsData
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(({ externalId, name }) => (
              <Option key={externalId} value={externalId}>
                <Body level={2}>{name}</Body>
              </Option>
            ));
        }
      }
      case 'webhook': {
        const nodesData = nodes.map((node) => {
          return node.data as ProcessNodeData;
        });
        const webhookList = nodesData.filter((node) => {
          return node.processType === 'webhook';
        });
        return webhookList
          .sort((a, b) => a.processType.localeCompare(b.processType))
          .map(({ processType }) => (
            <Option key={processType} value={processType}>
              <Body level={2}>{processType}</Body>
            </Option>
          ));
      }
    }
  };

  const handleComponentChange = (value: ProcessType) => {
    changeNodes((nodes) => {
      const node = nodes.find((node) => node.id === selectedNodeId);
      const nodeData = node?.data as ProcessNodeData;
      nodeData.processType = value;
    });
    setSelectedNodeComponent(value);
  };

  const handleItemChange = (value: string) => {
    changeNodes((nodes) => {
      const node = nodes.find((node) => node.id === selectedNodeId);
      const nodeData = node?.data as ProcessNodeData;
      nodeData.processItem = value;
    });
    setSelectedNodeItem(value);
  };

  return (
    <StyledDrawer
      title={t('node-configuration-panel-title')}
      placement="right"
      getContainer={false}
      onClose={onClose}
      open={isNodeConfigurationPanelOpen}
      maskClosable={true}
      mask={false}
      destroyOnClose={true}
      width="${FLOATING_COMPONENTS_PANEL_WIDTH}px"
      headerStyle={{
        padding: '12px',
        border: 'none',
      }}
      bodyStyle={{
        padding: '12px',
        gap: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
      maskStyle={{ backgroundColor: 'transparent' }}
    >
      <Flex direction="column">
        <Body level={2} strong>
          {t('node-configuration-panel-component')}
        </Body>
        <Select
          value={selectedNodeComponent}
          onChange={handleComponentChange}
          style={{ width: 326 }}
        >
          {nodeOptions.map(({ icon, label, value }) => (
            <Option key={value} value={value}>
              <Container>
                <Icon type={icon} />
                <Body level={2}>{label}</Body>
              </Container>
            </Option>
          ))}
        </Select>
      </Flex>
      <Flex direction="column">
        <Body level={2} strong>
          {t('node-configuration-panel-item')}
        </Body>
        <Select
          placeholder={t('node-configuration-panel-item-placeholder')}
          value={selectedNodeItem}
          onChange={handleItemChange}
          style={{ width: 326 }}
        >
          {itemCreateNewOption()}
          {itemOptions()}
        </Select>
      </Flex>
      <InputExp
        name="label"
        label={t('node-configuration-panel-label')}
        placeholder={t('node-configuration-panel-label-placeholder')}
        value={selectedNodeDescription}
        onChange={(e) => {
          const value = e.target.value;
          changeNodes((nodes) => {
            const node = nodes.find((node) => node.id === selectedNodeId);
            const nodeData = node?.data as ProcessNodeData;
            nodeData.processDescription = value;
          });
          setSelectedNodeDescription(value);
        }}
        variant="solid"
        style={{ width: 326 }}
      />
    </StyledDrawer>
  );
};

const StyledDrawer = styled(Drawer)`
  button.ant-drawer-close {
    position: absolute;
    right: 0px;
    padding: 12px;
  }
`;

const Container = styled(Flex).attrs({ alignItems: 'center', gap: 8 })`
  height: 100%;
`;
