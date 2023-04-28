import { Flex, InputExp, Body, IconType, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Drawer, Select } from 'antd';
import { useMemo } from 'react';

import { useTranslation } from 'common';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { useTransformationList } from 'hooks/transformation';
import { collectPages } from 'utils';

const { Option } = Select;

export const NodeConfigurationPanel = (): JSX.Element => {
  const { t } = useTranslation();

  const { isNodeConfigurationPanelOpen, setIsNodeConfigurationPanelOpen } =
    useWorkflowBuilderContext();

  const { data } = useTransformationList();
  const transformationList = useMemo(() => collectPages(data), [data]);

  const onClose = () => {
    setIsNodeConfigurationPanelOpen(false);
  };

  const nodeOptions: {
    value: string;
    label: string;
    icon: IconType;
  }[] = [
    {
      value: 'Transformation',
      label: t('transformation'),
      icon: 'Code',
    },
    {
      value: 'Function',
      label: t('function'),
      icon: 'Function',
    },
    {
      value: 'Webhook',
      label: t('webhook'),
      icon: 'FrameTool',
    },
  ];

  return (
    <StyledDrawer
      title={t('node-configuration-panel-title')}
      placement="right"
      getContainer={false}
      onClose={onClose}
      open={isNodeConfigurationPanelOpen}
      maskClosable={true}
      mask={false}
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
        <Select defaultValue="Transformation" style={{ width: 326 }}>
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
          style={{ width: 326 }}
        >
          {transformationList
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(({ externalId, name }) => (
              <Option key={externalId} value={externalId}>
                <Body level={2}>{name}</Body>
              </Option>
            ))}
        </Select>
      </Flex>
      <InputExp
        label={t('node-configuration-panel-label')}
        placeholder={t('node-configuration-panel-label-placeholder')}
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
