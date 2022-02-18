import React, { ReactText } from 'react';
import { Detail, Icon, PrimaryTooltip } from '@cognite/cogs.js';
import { keypointSelectStatusChange } from 'src/modules/Review/store/annotationLabel/slice';
import {
  selectAnnotation,
  toggleAnnotationVisibility,
  VisibleAnnotation,
} from 'src/modules/Review/store/reviewSlice';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { AnnotationStatusChange } from 'src/store/thunks/Annotation/AnnotationStatusChange';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import styled from 'styled-components';
import { AnnotationsTable } from 'src/modules/Review/Components/AnnotationsTable/AnnotationsTable';
import { VisionAPIType } from 'src/api/types';
import { useDispatch } from 'react-redux';
import { FileInfo } from '@cognite/sdk';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';

export const VideoContextualization = (props: {
  file: FileInfo;
  tagAnnotations?: VisibleAnnotation[];
  gdprAndTextAndObjectAnnotations?: VisibleAnnotation[];
}) => {
  const { file, tagAnnotations, gdprAndTextAndObjectAnnotations } = props;

  const dispatch = useDispatch();

  const handleVisibility = (id: ReactText) => {
    dispatch(
      toggleAnnotationVisibility({
        annotationId: +id,
      })
    );
  };

  const handleDeleteAnnotations = (id: ReactText) => {
    dispatch(
      DeleteAnnotationsAndHandleLinkedAssetsOfFile({
        annotationIds: [+id],
        showWarnings: true,
      })
    );
  };

  const handleApprovalState = async (
    id: ReactText,
    status: AnnotationStatus
  ) => {
    await dispatch(AnnotationStatusChange({ id: +id, status }));
  };

  const handleOnAnnotationSelect = (id: ReactText, nextState: boolean) => {
    dispatch(deselectAllSelectionsReviewPage());
    if (nextState) {
      dispatch(selectAnnotation(+id));
    }
  };

  const onKeypointSelect = (id: ReactText) => {
    dispatch(keypointSelectStatusChange(id.toString()));
  };

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
            title="Asset tags in image"
            file={file}
            annotations={tagAnnotations}
            mode={VisionAPIType.TagDetection}
            onDelete={handleDeleteAnnotations}
            onVisibilityChange={handleVisibility}
            onApproveStateChange={handleApprovalState}
            onSelect={handleOnAnnotationSelect}
            onKeypointSelect={onKeypointSelect}
          />
        )}
        {gdprAndTextAndObjectAnnotations && (
          <AnnotationsTable
            file={file}
            title="Text and objects in image"
            annotations={gdprAndTextAndObjectAnnotations}
            onDelete={handleDeleteAnnotations}
            onVisibilityChange={handleVisibility}
            onApproveStateChange={handleApprovalState}
            onSelect={handleOnAnnotationSelect}
            onKeypointSelect={onKeypointSelect}
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
  grid-template-rows: auto calc(100% - 50px);
  padding-top: 15px;
  box-sizing: border-box;
`;

const TableContainer = styled.div`
  overflow-y: auto;
`;
