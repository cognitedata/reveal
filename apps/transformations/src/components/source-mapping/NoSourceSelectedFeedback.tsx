import { useState } from 'react';

import styled from 'styled-components';

import {
  EDITOR_COLUMN_MAX_WIDTH,
  EDITOR_COLUMN_MIN_WIDTH,
  EDITOR_VIEW_COLUMN_GAP,
  useTranslation,
} from '@transformations/common';
import SourceSelectionModal from '@transformations/components/source-selection-modal';
import DestinationSchema from '@transformations/components/target/DestinationSchema';
import TargetDescriptionDropDown from '@transformations/components/target/TargetDescriptionDropDown';
import { TransformationRead } from '@transformations/types';
import { shouldDisableUpdatesOnTransformation } from '@transformations/utils';

import { Colors, Body, Button, Overline } from '@cognite/cogs.js';

type Props = { transformation: TransformationRead };
export default function NoSourceSelectedFeedback({ transformation }: Props) {
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const { t } = useTranslation();
  return (
    <StyledView>
      <StyledCodeEditorColumn>
        <Container>
          <FeedbackBody>{t('select-source-description')}</FeedbackBody>
          {sourceModalVisible && (
            <SourceSelectionModal
              onCancel={() => setSourceModalVisible(false)}
              transformation={transformation}
            />
          )}
          <Button
            onClick={() => setSourceModalVisible(true)}
            size="small"
            type="ghost-accent"
            disabled={shouldDisableUpdatesOnTransformation(transformation)}
          >
            {t('select-source')}
          </Button>
        </Container>
      </StyledCodeEditorColumn>
      <StyledColumn>
        <StyledColumnHeader>{t('target-title')}</StyledColumnHeader>
        <TargetDescriptionDropDown transformation={transformation} />
        <StyledColumnContent>
          <DestinationSchema
            action={transformation.conflictMode}
            destination={transformation.destination}
            transformation={transformation}
          />
        </StyledColumnContent>
      </StyledColumn>
    </StyledView>
  );
}

const Container = styled.div`
  align-items: center;
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 36px 36px 100px;
  width: 100%;
  gap: 8px;
`;

const FeedbackBody = styled(Body).attrs({ level: 3 })`
  color: ${Colors['text-icon--muted']};
  text-align: center;
`;

const StyledColumn = styled.div`
  flex: 1 1 0;
  max-width: ${EDITOR_COLUMN_MAX_WIDTH}px;
  min-width: ${EDITOR_COLUMN_MIN_WIDTH}px;
`;

const StyledCodeEditorColumn = styled(StyledColumn)`
  flex: 2 2 0;
  max-width: unset;
`;

const StyledView = styled.div`
  display: flex;
  gap: ${EDITOR_VIEW_COLUMN_GAP}px;
  max-width: 100%;
  width: 100%;
`;

const StyledColumnHeader = styled(Overline).attrs({ level: 2 })`
  color: ${Colors['text-icon--status-neutral']};
`;

const StyledColumnContent = styled.div`
  margin-top: 8px;
`;
