import styled from 'styled-components';

import { EDITOR_VIEW_COLUMN_GAP } from '@transformations/common';
import EditorTitleRow from '@transformations/components/editor-header-row';
import { isMappingMode } from '@transformations/components/source-mapping/utils';
import {
  PageDirection,
  useTransformationContext,
} from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';

import { Colors, Elevations } from '@cognite/cogs.js';

import MappingEditorView from './MappingEditorView';
import SQLEditorView from './SQLEditorView';

type EditorSectionProps = {
  transformation: TransformationRead;
};

const EditorSection = ({ transformation }: EditorSectionProps): JSX.Element => {
  const mappingModeEnabled = isMappingMode(transformation.query);

  const { pageDirection } = useTransformationContext();

  return (
    <StyledContainer $direction={pageDirection}>
      <StyledSection>
        <EditorTitleRow transformationId={transformation.id} />
        <StyledContent>
          {mappingModeEnabled ? (
            <MappingEditorView transformation={transformation} />
          ) : (
            <SQLEditorView transformation={transformation} />
          )}
        </StyledContent>
      </StyledSection>
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{
  $direction: PageDirection;
}>`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${({ $direction }) =>
    $direction === 'vertical' ? '12px 12px 7px 12px' : '12px 6px 12px 12px'};
`;

const StyledSection = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const StyledContent = styled.div<{ $isMappingMode?: boolean }>`
  display: flex;
  padding: ${EDITOR_VIEW_COLUMN_GAP}px;
  flex: 1;
  overflow: auto;
`;

export default EditorSection;
