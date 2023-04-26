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
import { WORKFLOW_COMPONENT_TYPES } from 'utils/workflow';
import { WorkflowComponentType } from 'types/workflow';

import { FloatingComponentsPanelItem } from './NodeConfigurationPanelItem';

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
      icon: 'Sunrise',
    },
    {
      value: 'Function',
      label: 'Function',
      icon: 'Sunrise',
    },
    {
      value: 'Webhook',
      label: 'Webhook',
      icon: 'Sunrise',
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
        css={{ width: 326 }}
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
  background-color: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--interactive--default']};
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  right: 0px;
  padding: 12px;
  position: absolute;
  top: 0px;
  width: ${FLOATING_COMPONENTS_PANEL_WIDTH}px;
  z-index: ${Z_INDEXES.FLOATING_ELEMENT};
`;

const Container = styled(Flex).attrs({ alignItems: 'center', gap: 8 })`
  height: 100%;
`;
