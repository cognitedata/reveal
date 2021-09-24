import React, { ReactText } from 'react';
import { Detail, Icon, PrimaryTooltip } from '@cognite/cogs.js';
import {
  currentCollection,
  deleteCollectionById,
  deSelectAllCollections,
  deselectAllKeypoints,
  keypointSelectStatusChange,
  selectCollection,
  setCollectionStatus,
  toggleCollectionVisibility,
} from 'src/modules/Review/store/annotationLabelSlice';
import {
  deselectAllAnnotations,
  selectAnnotation,
  toggleAnnotationVisibility,
  VisibleAnnotation,
} from 'src/modules/Review/store/reviewSlice';
import { ApproveAnnotation } from 'src/store/thunks/Annotation/ApproveAnnotation';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import styled from 'styled-components';
import { AnnotationsTable } from 'src/modules/Review/Components/AnnotationsTable/AnnotationsTable';
import { RootState } from 'src/store/rootReducer';
import { VisionAPIType } from 'src/api/types';
import { useDispatch, useSelector } from 'react-redux';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { convertKeyPointCollectionToAnnotationStub } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ConversionUtils';
import { AnnotationStatus, VisionAnnotation } from 'src/utils/AnnotationUtils';
import { AnnotationTableItem } from 'src/modules/Review/types';

export const ImageContextualization = (props: {
  file: FileInfo;
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
    annotation: AnnotationTableItem,
    status: AnnotationStatus
  ) => {
    await dispatch(
      ApproveAnnotation({
        ...(annotation as VisionAnnotation),
        status,
      })
    );
  };

  const handleOnAnnotationSelect = (id: ReactText, nextState: boolean) => {
    if (nextState) {
      dispatch(selectAnnotation(+id));
    } else {
      dispatch(deselectAllAnnotations());
    }
    dispatch(deSelectAllCollections());
    dispatch(deselectAllKeypoints());
  };

  // keypoint annotation changes

  const onKeypointCollectionSelect = (id: ReactText, nextState: boolean) => {
    if (nextState) {
      dispatch(deselectAllAnnotations());
      dispatch(deselectAllKeypoints());
      dispatch(selectCollection(id.toString()));
    } else {
      dispatch(deSelectAllCollections());
    }
  };

  const onKeypointCollectionVisibilityChange = (id: ReactText) => {
    dispatch(toggleCollectionVisibility(id.toString()));
  };

  const onKeypointCollectionDelete = (id: ReactText) => {
    dispatch(deleteCollectionById(id.toString()));
  };

  const onKeypointCollectionApprovalStateChange = (
    annotation: AnnotationTableItem,
    status: AnnotationStatus
  ) => {
    dispatch(setCollectionStatus({ id: annotation.id.toString(), status }));
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
