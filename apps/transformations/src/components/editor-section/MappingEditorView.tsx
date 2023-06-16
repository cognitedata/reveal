import styled from 'styled-components';

import {
  ARROW_COLUMN_MAX_WIDTH,
  ARROW_COLUMN_MIN_WIDTH,
  EDITOR_COLUMN_MAX_WIDTH,
  EDITOR_COLUMN_MIN_WIDTH,
  EDITOR_VIEW_COLUMN_GAP,
  useTranslation,
} from '@transformations/common';
import MappingList from '@transformations/components/source-mapping/MappingList';
import NoSourceSelectedFeedback from '@transformations/components/source-mapping/NoSourceSelectedFeedback';
import SourceSelectionMenu from '@transformations/components/source-mapping/SourceSelectionMenu';
import { getTransformationMapping } from '@transformations/components/source-mapping/utils';
import TargetDescriptionDropDown from '@transformations/components/target/TargetDescriptionDropDown';
import { TransformationRead } from '@transformations/types';

import { Colors, Overline } from '@cognite/cogs.js';

type MappingEditorViewProps = {
  transformation: TransformationRead;
};

const MappingEditorView = ({
  transformation,
}: MappingEditorViewProps): JSX.Element => {
  const { t } = useTranslation();

  const mapping = getTransformationMapping(transformation.query);
  const sourceSelected = !!mapping?.sourceLevel1 && !!mapping?.sourceLevel2;

  if (!sourceSelected) {
    return <NoSourceSelectedFeedback transformation={transformation} />;
  }

  return (
    <StyledMappingView>
      <StyledMappingViewSection>
        <StyledMappingViewColumn>
          <StyledColumnHeader>{t('source-title')}</StyledColumnHeader>
          <SourceSelectionMenu transformation={transformation} />
        </StyledMappingViewColumn>
        <StyledArrowColumn />
        <StyledMappingViewColumn>
          <StyledColumnHeader>{t('target-title')}</StyledColumnHeader>
          <TargetDescriptionDropDown transformation={transformation} />
        </StyledMappingViewColumn>
      </StyledMappingViewSection>
      <StyledMappingViewSection>
        <MappingList transformation={transformation} />
      </StyledMappingViewSection>
    </StyledMappingView>
  );
};

const StyledMappingView = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;
  width: 100%;
`;

const StyledColumnHeader = styled(Overline).attrs({ level: 2 })`
  color: ${Colors['text-icon--status-neutral']};
`;

export const StyledMappingViewSection = styled.div`
  align-items: center;
  display: flex;
  gap: ${EDITOR_VIEW_COLUMN_GAP}px;
  justify-content: center;
  width: 100%;
`;

export const StyledMappingViewColumn = styled.div`
  flex: 10 10 0;
  max-width: ${EDITOR_COLUMN_MAX_WIDTH}px;
  min-width: ${EDITOR_COLUMN_MIN_WIDTH}px;
`;

export const StyledArrowColumn = styled.div`
  display: flex;
  flex: 1 1 0;
  justify-content: center;
  max-width: ${ARROW_COLUMN_MAX_WIDTH}px;
  min-width: ${ARROW_COLUMN_MIN_WIDTH}px;
`;

export default MappingEditorView;
