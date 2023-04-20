import {
  Button,
  Colors,
  Detail,
  Elevations,
  Flex,
  Title,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import {
  CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
  FLOATING_COMPONENTS_PANEL_WIDTH,
  FLOATING_ELEMENT_MARGIN,
  Z_INDEXES,
  useTranslation,
} from 'common';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';

import { FloatingComponentsPanelItem } from './FloatingComponentsPanelItem';
import { PROCESS_TYPES, ProcessType } from 'types';

export const FloatingComponentsPanel = (): JSX.Element => {
  const { t } = useTranslation();

  const { setIsComponentsPanelVisible } = useWorkflowBuilderContext();

  const onDragStart = (event: React.DragEvent<Element>, type: ProcessType) => {
    event.dataTransfer.setData(
      CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
      type
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <FloatingPanel>
      <Flex alignItems="flex-start" justifyContent="space-between">
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
        {PROCESS_TYPES.map((type) => (
          <FloatingComponentsPanelItem
            key={type}
            onDragStart={(e) => onDragStart(e, type)}
            type={type}
          />
        ))}
      </Flex>
    </FloatingPanel>
  );
};

const FloatingPanel = styled.div`
  background-color: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100% - ${FLOATING_ELEMENT_MARGIN * 2}px);
  left: ${FLOATING_ELEMENT_MARGIN}px;
  padding: 12px;
  position: absolute;
  top: ${FLOATING_ELEMENT_MARGIN}px;
  width: ${FLOATING_COMPONENTS_PANEL_WIDTH}px;
  z-index: ${Z_INDEXES.FLOATING_ELEMENT};
`;
