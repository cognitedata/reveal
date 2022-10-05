import styled from 'styled-components';

import {
  CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
  useTranslation,
} from 'common';
import { CanvasBlock, CanvasBlockType } from 'components/canvas-block';

import { blocks } from './blocks';
import { Colors, Detail, Flex, Title } from '@cognite/cogs.js';

export const CanvasSidePanel = (): JSX.Element => {
  const { t } = useTranslation();

  const onDragStart = (
    event: React.DragEvent<Element>,
    type: CanvasBlockType
  ) => {
    event.dataTransfer.setData(
      CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
      type
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <StyledSidePanelContainer>
      <Flex direction="column">
        <Title level={6}>{t('toolbox-title')}</Title>
        <StyledSidePanelHeaderDescription>
          {t('toolbox-description')}
        </StyledSidePanelHeaderDescription>
      </Flex>
      <StylesCanvasBlockList>
        {blocks.map((blockProps) => (
          <CanvasBlock
            key={blockProps.label}
            onDragStart={(event) => onDragStart(event, blockProps.type)}
            {...blockProps}
          />
        ))}
      </StylesCanvasBlockList>
    </StyledSidePanelContainer>
  );
};

const StyledSidePanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 24px;
`;

const StyledSidePanelHeaderDescription = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

const StylesCanvasBlockList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
`;
