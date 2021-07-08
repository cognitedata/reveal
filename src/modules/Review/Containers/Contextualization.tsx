import React from 'react';
import { Detail, Icon, PrimaryTooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AnnotationsTable } from 'src/modules/Review/Components/AnnotationsTable/AnnotationsTable';
import { VisionAnnotationState } from 'src/modules/Review/previewSlice';
import { RootState } from 'src/store/rootReducer';
import { VisionAPIType } from 'src/api/types';
import { useSelector } from 'react-redux';

export const Contextualization = (props: {
  tagAnnotations?: VisionAnnotationState[];
  gdprAndTextAndObjectAnnotations?: VisionAnnotationState[];
}) => {
  const { tagAnnotations, gdprAndTextAndObjectAnnotations } = props;
  const selectedAnnotationIds = useSelector(
    (state: RootState) => state.previewSlice.selectedAnnotationIds
  );

  return (
    <Container>
      <Detail style={{ color: '#595959' }}>
        {'Approve and reject detected annotations '}
        <PrimaryTooltip
          tooltipTitle="Labeling annotations"
          tooltipText={`
              Pressing True or False will label the predictions in order to improve the 
              future quality of the annotation detection. Pressing False will not delete the annotation.
              `}
        >
          <Icon style={{ color: '#BFBFBF' }} type="HelpFilled" />
        </PrimaryTooltip>
      </Detail>

      <TableContainer>
        {tagAnnotations && (
          <AnnotationsTable
            annotations={tagAnnotations}
            selectedAnnotationIds={selectedAnnotationIds}
            mode={VisionAPIType.TagDetection}
          />
        )}
        {gdprAndTextAndObjectAnnotations && (
          <AnnotationsTable
            annotations={gdprAndTextAndObjectAnnotations}
            selectedAnnotationIds={selectedAnnotationIds}
            mode={VisionAPIType.ObjectDetection} // TODO: only used to check if it is a tagdetection (?), refactor
          />
        )}
      </TableContainer>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: auto calc(100% - 50px) auto;
  padding-top: 15px;
  box-sizing: border-box;
`;

const TableContainer = styled.div`
  overflow-y: auto;
`;
