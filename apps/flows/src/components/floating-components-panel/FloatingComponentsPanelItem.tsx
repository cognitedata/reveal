import { DragEventHandler } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@flows/common';
import { PROCESS_ICON, ProcessType } from '@flows/types';

import { Body, Colors, Flex, Icon } from '@cognite/cogs.js';

type FloatingComponentsPanelItemProps = {
  onDragStart: DragEventHandler;
  type: ProcessType;
};

export const FloatingComponentsPanelItem = ({
  onDragStart,
  type,
}: FloatingComponentsPanelItemProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ItemContainer draggable onDragStart={onDragStart}>
      <Flex gap={8}>
        <ComponentTypeIconContainer>
          <Icon type={PROCESS_ICON[type]} />
        </ComponentTypeIconContainer>
        <Flex direction="column" justifyContent="space-between">
          <Body level={3} strong>
            {t(`component-title-${type}`)}
          </Body>
          <Body level={3} muted>
            {t(`component-description-${type}`)}
          </Body>
        </Flex>
      </Flex>
      <DragHandleIconContainer>
        <Icon type="DragHandleVertical" />
      </DragHandleIconContainer>
    </ItemContainer>
  );
};

const ItemContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  cursor: grab;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  transform: translate(0, 0);
  width: 100%;

  :hover {
    border: 1px solid ${Colors['border--interactive--default--alt']};
  }
`;

const ComponentTypeIconContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--status-neutral--muted--default']};
  border-radius: 6px;
  color: ${Colors['text-icon--interactive--default']};
  display: flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const DragHandleIconContainer = styled.div`
  align-items: center;
  color: ${Colors['text-icon--muted']};
  display: flex;
`;
