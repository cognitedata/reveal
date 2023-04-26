import {
  Button,
  Colors,
  Detail,
  Elevations,
  Flex,
  Title,
  InputExp,
  Body,
  IconType,
  Icon,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { Drawer, Select } from 'antd';
import React, { useState } from 'react';

import {
  CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
  FLOATING_COMPONENTS_PANEL_WIDTH,
  FLOATING_ELEMENT_MARGIN,
  Z_INDEXES,
  useTranslation,
} from 'common';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { WorkflowComponentType } from 'types/workflow';

const { Option } = Select;

export const NodeConfigurationPanel = (): JSX.Element => {
  const { t } = useTranslation();

  const { setIsComponentsPanelVisible } = useWorkflowBuilderContext();

  const onDragStart = (
    event: React.DragEvent<Element>,
    type: WorkflowComponentType
  ) => {
    event.dataTransfer.setData(
      CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
      type
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const [open, setOpen] = useState(true);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  console.log(open);

  const nodeOptions: {
    value: string;
    label: string;
    icon: IconType;
  }[] = [
    {
      value: 'Transformation',
      label: 'Transformation',
      icon: 'Code',
    },
    {
      value: 'Function',
      label: 'Function',
      icon: 'Function',
    },
    {
      value: 'Webhook',
      label: 'Webhook',
      icon: 'FrameTool',
    },
  ];

  return (
    // <React.Fragment>
    // {/* <Button type="primary" onClick={showDrawer}>
    //   Open
    // </Button> */}
    <StyledDrawer
      title="Configuration"
      placement="right"
      onClose={onClose}
      open={open}
      getContainer={false}
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
    >
      <Flex direction="column">
        <Body level={2} strong>
          {'Component'}
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
          {'Item'}
        </Body>
        <Select
          placeholder="Choose existing or create new"
          style={{ width: 326 }}
          options={[
            {
              value: '1',
              label: 'Not Identified',
            },
          ]}
        />
      </Flex>
      <InputExp
        label="Label"
        placeholder="Enter a descriptive label to display"
        variant="solid"
        style={{ width: 326 }}
      />
      {/* <Flex alignItems="flex-start" justifyContent="space-between">
        <Flex direction="column">
          <Title level={6}>{t('floating-components-panel-title')}</Title>
          <Detail muted>{t('floating-components-panel-description')}</Detail>
        </Flex>
        <Button
          icon="CloseLarge"
          onClick={() => setIsComponentsPanelVisible(false)}
          type="ghost"
        />
      </Flex>
      <Flex direction="column" gap={8}>
        {WORKFLOW_COMPONENT_TYPES.map((type) => (
          <FloatingComponentsPanelItem
            key={type}
            onDragStart={(e) => onDragStart(e, type)}
            type={type}
          />
        ))}
      </Flex> */}
    </StyledDrawer>
    // </React.Fragment>
  );
};

const StyledDrawer = styled(Drawer)`
  button.ant-drawer-close {
    position: absolute;
    right: 0px;
  }
`;

const Container = styled(Flex).attrs({ alignItems: 'center', gap: 8 })`
  height: 100%;
`;
