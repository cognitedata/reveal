import { Flex, InputExp, Body, IconType, Icon, Link } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { Drawer, Select } from 'antd';
import { useMemo } from 'react';

import { useTranslation } from 'common';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { useTransformationList } from 'hooks/transformation';
import { useFlowList } from 'hooks/files';
import { useFunctions } from 'hooks/functions';
import { collectPages } from 'utils';
import { ProcessNodeData, ProcessType, CanvasNode } from 'types';

const { Option } = Select;

export const NodeConfigurationPanel = (): JSX.Element => {
  const { t } = useTranslation();

  const {
    nodes,
    isNodeConfigurationPanelOpen,
    setIsNodeConfigurationPanelOpen,
    changeNodes,
    selectedObject,
    selectedObjectData,
  } = useWorkflowBuilderContext();

  const selectedNodeProcessType = 'hi';
  // console.log(selectedObject);
  // console.log(selectedObjectData?.processType);
  // const test2 = useCallback(() => {
  //   const testing = getselectedObjectData(selectedObject);
  //   const newComponent = testing?.processType;
  //   if (newComponent) {
  //     setSelectedNodeComponent(newComponent);
  //   }
  // }, [setSelectedNodeComponent]);

  // const test = useCallback(
  //   () => setIsNodeConfigurationPanelOpen(false),
  //   [selectedObject]
  // );
  // console.log(test);

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
    {
      value: 'workflow',
      label: t('workflow'),
      icon: 'Pipeline',
    },
  ];

  const itemCreateNewOption = () => {
    switch (selectedObjectData?.processType) {
      case 'transformation': {
        return (
          <Option
            key={t('create-new-item', {
              item: selectedObjectData?.processType,
            })}
            value={t('create-new-item', {
              item: selectedObjectData?.processType,
            })}
          >
            <Link href={createLink('/transformations')} target="_blank">
              {t('create-new-item', { item: selectedObjectData?.processType })}
            </Link>
          </Option>
        );
      }
      case 'workflow': {
        return (
          <Option
            key={t('create-new-item', {
              item: selectedObjectData?.processType,
            })}
            value={t('create-new-item', {
              item: selectedObjectData?.processType,
            })}
          >
            <Link href="./" target="_blank">
              {t('create-new-item', { item: selectedObjectData?.processType })}
            </Link>
          </Option>
        );
      }
      case 'function': {
        return (
          <Option
            key={t('create-new-item', {
              item: selectedObjectData?.processType,
            })}
            value={t('create-new-item', {
              item: selectedObjectData?.processType,
            })}
          >
            <Link href={createLink('/functions')} target="_blank">
              {t('create-new-item', { item: selectedObjectData?.processType })}
            </Link>
          </Option>
        );
      }
      case 'webhook': {
        return (
          <Option
            key={t('create-new-item', {
              item: selectedObjectData?.processType,
            })}
            value={t('create-new-item', {
              item: selectedObjectData?.processType,
            })}
          >
            <Body level={2}>
              {t('create-new-item', { item: selectedObjectData?.processType })}
            </Body>
          </Option>
        );
      }
    }
  };

  const itemOptions = () => {
    switch (selectedObjectData?.processType) {
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
      const node = nodes.find((node) => node.id === selectedObject);
      const nodeData = node?.data as ProcessNodeData;
      nodeData.processType = value;
      nodeData.processItem = '';
    });
  };

  const handleItemChange = (value: string) => {
    let newValue = value;
    if (value === `Create new ${selectedObjectData?.processType}`) {
      newValue = '';
    }
    changeNodes((nodes) => {
      const node = nodes.find((node) => node.id === selectedObject);
      const nodeData = node?.data as ProcessNodeData;
      nodeData.processItem = newValue;
    });
  };

  console.log(selectedObjectData?.processDescription);

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
          value={selectedObjectData?.processType}
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
          value={
            selectedObjectData?.processItem === ''
              ? undefined
              : selectedObjectData?.processItem
          }
          onChange={handleItemChange}
          style={{ width: 326, flex: 1 }}
        >
          {itemCreateNewOption()}
          {itemOptions()}
        </Select>
      </Flex>
      <InputExp
        name="label"
        label={t('node-configuration-panel-label')}
        placeholder={t('node-configuration-panel-label-placeholder')}
        value={
          selectedObjectData?.processDescription === '' ||
          selectedObjectData?.processDescription === undefined
            ? ''
            : selectedObjectData?.processDescription
        }
        onChange={(e) => {
          const value = e.target.value;
          changeNodes((nodes) => {
            const node = nodes.find((node) => node.id === selectedObject);
            const nodeData = node?.data as ProcessNodeData;
            nodeData.processDescription = value;
          });
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
