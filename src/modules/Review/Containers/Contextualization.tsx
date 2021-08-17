import React, { ReactText, useMemo } from 'react';
import { Detail, Icon, PrimaryTooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AnnotationsTable } from 'src/modules/Review/Components/AnnotationsTable/AnnotationsTable';
import {
  deselectAllAnnotations,
  selectAnnotation,
  toggleAnnotationVisibility,
  VisionAnnotationState,
} from 'src/modules/Review/previewSlice';
import { RootState } from 'src/store/rootReducer';
import { VisionAPIType } from 'src/api/types';
import { useDispatch, useSelector } from 'react-redux';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { convertKeyPointCollectionToAnnotationStub } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ConversionUtils';
import {
  currentCollection,
  deleteCollectionById,
  deSelectAllCollections,
  deselectAllKeypoints,
  keypointSelectStatusChange,
  selectCollection,
  setCollectionStatus,
  toggleCollectionVisibility,
} from 'src/modules/Review/imagePreviewSlice';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { ApproveAnnotation } from 'src/store/thunks/ApproveAnnotation';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { AnnotationTableItem } from 'src/modules/Review/types';

export const Contextualization = (props: {
  file: FileInfo;
  tagAnnotations?: VisionAnnotationState[];
  gdprAndTextAndObjectAnnotations?: VisionAnnotationState[];
}) => {
  const { file, tagAnnotations, gdprAndTextAndObjectAnnotations } = props;

  const dispatch = useDispatch();
  const selectedAnnotationIds = useSelector(
    (state: RootState) => state.previewSlice.selectedAnnotationIds
  );

  const currentKeypointCollection = useSelector(
    ({ imagePreviewReducer }: RootState) =>
      currentCollection(imagePreviewReducer)
  );

  const selectedKeypointCollectionIds = useSelector(
    (state: RootState) => state.imagePreviewReducer.collections.selectedIds
  );

  const selectedKeypointIds = useSelector(
    (state: RootState) => state.imagePreviewReducer.keypointMap.selectedIds
  );

  const selectedKeypointCollectionAnnotationIds = useMemo(() => {
    return [...selectedAnnotationIds, ...selectedKeypointCollectionIds];
  }, [selectedKeypointCollectionIds, selectedAnnotationIds]);

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
        ...(annotation as VisionAnnotationState),
        status,
      })
    );
  };

  const handleOnAnnotationSelect = (id: ReactText) => {
    const alreadySelected = selectedAnnotationIds.includes(+id);
    if (alreadySelected) {
      dispatch(deselectAllAnnotations());
    } else {
      dispatch(selectAnnotation(+id));
    }
    dispatch(deSelectAllCollections());
    dispatch(deselectAllKeypoints());
  };

  // keypoint annotation changes

  const onKeypointCollectionSelect = (id: ReactText) => {
    const alreadySelected = selectedKeypointCollectionIds.includes(
      id.toString()
    );
    if (alreadySelected) {
      dispatch(deSelectAllCollections());
    } else {
      dispatch(deselectAllAnnotations());
      dispatch(deselectAllKeypoints());
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
            selectedAnnotationIds={selectedKeypointCollectionAnnotationIds}
            mode={VisionAPIType.TagDetection}
            onDelete={handleDeleteAnnotations}
            onVisibilityChange={handleVisibility}
            onApproveStateChange={handleApprovalState}
            onSelect={handleOnAnnotationSelect}
            onKeypointSelect={onKeypointSelect}
            selectedKeypointIds={selectedKeypointIds}
          />
        )}
        {gdprAndTextAndObjectAnnotations && (
          <AnnotationsTable
            file={file}
            title="Text and objects in image"
            annotations={gdprAndTextAndObjectAnnotations}
            selectedAnnotationIds={selectedKeypointCollectionAnnotationIds}
            onDelete={handleDeleteAnnotations}
            onVisibilityChange={handleVisibility}
            onApproveStateChange={handleApprovalState}
            onSelect={handleOnAnnotationSelect}
            onKeypointSelect={onKeypointSelect}
            selectedKeypointIds={selectedKeypointIds}
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
            selectedAnnotationIds={selectedKeypointCollectionIds}
            onDelete={onKeypointCollectionDelete}
            onVisibilityChange={onKeypointCollectionVisibilityChange}
            onApproveStateChange={onKeypointCollectionApprovalStateChange}
            onSelect={onKeypointCollectionSelect}
            onKeypointSelect={onKeypointSelect}
            selectedKeypointIds={selectedKeypointIds}
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
