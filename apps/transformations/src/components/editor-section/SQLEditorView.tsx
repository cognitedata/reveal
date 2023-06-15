import styled from 'styled-components';

import {
  EDITOR_COLUMN_MAX_WIDTH,
  EDITOR_COLUMN_MIN_WIDTH,
  EDITOR_VIEW_COLUMN_GAP,
  useTranslation,
} from '@transformations/common';
import DestinationSchema from '@transformations/components/target/DestinationSchema';
import TargetDescriptionDropDown from '@transformations/components/target/TargetDescriptionDropDown';
import TransformationDetailsSQLEditor from '@transformations/pages/transformation-details/TransformationDetailsSQLEditor';
import { TransformationRead } from '@transformations/types';

import { Colors, Overline } from '@cognite/cogs.js';

type SQLEditorViewProps = {
  transformation: TransformationRead;
};

const SQLEditorView = ({ transformation }: SQLEditorViewProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <StyledView>
      <StyledCodeEditorColumn>
        <TransformationDetailsSQLEditor transformation={transformation} />
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
};

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

export default SQLEditorView;
