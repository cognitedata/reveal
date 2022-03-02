import React, { ReactText } from 'react';
import { Detail, Icon, PrimaryTooltip } from '@cognite/cogs.js';
import {
  deleteCollectionById,
  keypointSelectStatusChange,
  selectCollection,
  setCollectionStatus,
  toggleCollectionVisibility,
} from 'src/modules/Review/store/annotationLabel/slice';

import { currentCollection } from 'src/modules/Review/store/annotationLabel/selectors';
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
import { RootState } from 'src/store/rootReducer';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { useDispatch, useSelector } from 'react-redux';
import { FileInfo } from '@cognite/sdk';
import { convertKeyPointCollectionToAnnotationStub } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ConversionUtils';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';

export const ImageContextualization = (props: {
  file: FileInfo;
  reference: any;
  tagAnnotations: VisibleAnnotation[];
  otherAnnotations: VisibleAnnotation[];
}) => {
  const { file, tagAnnotations, otherAnnotations } = props;

  const dispatch = useDispatch();

  const currentKeypointCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      currentCollection(annotationLabelReducer)
  );

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

  // keypoint annotation changes

  const onKeypointCollectionSelect = (id: ReactText, nextState: boolean) => {
    dispatch(deselectAllSelectionsReviewPage());
    if (nextState) {
      dispatch(selectCollection(id.toString()));
    }
  };

  const onKeypointCollectionVisibilityChange = (id: ReactText) => {
    dispatch(toggleCollectionVisibility(id.toString()));
  };

  const onKeypointCollectionDelete = (id: ReactText) => {
    dispatch(deleteCollectionById(id.toString()));
  };

  const onKeypointCollectionApprovalStateChange = (
    id: ReactText,
    status: AnnotationStatus
  ) => {
    dispatch(setCollectionStatus({ id: id.toString(), status }));
  };

  const onKeypointSelect = (id: ReactText) => {
    dispatch(keypointSelectStatusChange(id.toString()));
  };

  return (
    <Container ref={props.reference}>
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
            mode={VisionDetectionModelType.TagDetection}
            onDelete={handleDeleteAnnotations}
            onVisibilityChange={handleVisibility}
            onApproveStateChange={handleApprovalState}
            onSelect={handleOnAnnotationSelect}
            onKeypointSelect={onKeypointSelect}
          />
        )}
        {otherAnnotations && (
          <AnnotationsTable
            file={file}
            title="Text and objects in image"
            annotations={otherAnnotations}
            onDelete={handleDeleteAnnotations}
            onVisibilityChange={handleVisibility}
            onApproveStateChange={handleApprovalState}
            onSelect={handleOnAnnotationSelect}
            onKeypointSelect={onKeypointSelect}
          />
        )}
        {currentKeypointCollection && (
          <AnnotationsTable
            title="unfinished keypoint annotations"
            file={file}
            annotations={[
              {
                ...convertKeyPointCollectionToAnnotationStub(
                  currentKeypointCollection
                ),
              },
            ]}
            onDelete={onKeypointCollectionDelete}
            onVisibilityChange={onKeypointCollectionVisibilityChange}
            onApproveStateChange={onKeypointCollectionApprovalStateChange}
            onSelect={onKeypointCollectionSelect}
            onKeypointSelect={onKeypointSelect}
            expandAllRowsByDefault
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
