import React, { ReactText, useCallback, useMemo } from 'react';
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
  selectVisibleAnnotationsForFile,
  toggleAnnotationVisibility,
} from 'src/modules/Review/store/reviewSlice';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { AnnotationStatusChange } from 'src/store/thunks/Annotation/AnnotationStatusChange';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import styled from 'styled-components';
import { RootState } from 'src/store/rootReducer';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { useDispatch, useSelector } from 'react-redux';
import { FileInfo } from '@cognite/sdk';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import {
  ReviewAnnotation,
  VirtualizedAnnotationsReview,
} from 'src/modules/Review/Containers/VirtualizedAnnotationsReview';
import { convertKeyPointCollectionToAnnotationStub } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ConversionUtils';
import { TagAnnotationReviewRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/TagAnnotationReviewRow';
import { KeypointAnnotationReviewRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/KeypointAnnotationReviewRow';
import { AnnotationReviewRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/AnnotationReviewRow';

export const ImageContextualization = (props: {
  file: FileInfo;
  reference: any;
}) => {
  const { file } = props;

  const dispatch = useDispatch();

  const visibleAnnotations = useSelector((rootState: RootState) =>
    selectVisibleAnnotationsForFile(rootState, file.id)
  );

  const currentKeypointCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      currentCollection(annotationLabelReducer)
  );

  const selectedCategory = useMemo(() => {
    return visibleAnnotations.find((annotation) => annotation.selected)
      ?.modelType;
  }, [visibleAnnotations]);

  const tagAnnotations = useMemo(() => {
    return visibleAnnotations.filter(
      (annotation) =>
        annotation.modelType === VisionDetectionModelType.TagDetection
    );
  }, [visibleAnnotations]);

  const objectAnnotations = useMemo(() => {
    const savedObjectAnnotations = visibleAnnotations.filter(
      (annotation) =>
        annotation.modelType === VisionDetectionModelType.ObjectDetection
    ) as ReviewAnnotation[];
    if (currentKeypointCollection) {
      return savedObjectAnnotations.concat([
        {
          ...convertKeyPointCollectionToAnnotationStub(
            currentKeypointCollection
          ),
        },
      ]);
    }
    return savedObjectAnnotations;
  }, [visibleAnnotations, currentKeypointCollection]);

  const textAnnotations = useMemo(() => {
    return visibleAnnotations.filter(
      (annotation) => annotation.modelType === VisionDetectionModelType.OCR
    );
  }, [visibleAnnotations]);

  const handleVisibility = useCallback(
    (id: ReactText) => {
      if (id === currentKeypointCollection?.id) {
        // when creating keypoint collections
        dispatch(toggleCollectionVisibility(id.toString()));
      } else {
        dispatch(
          toggleAnnotationVisibility({
            annotationId: +id,
          })
        );
      }
    },
    [currentKeypointCollection?.id]
  );

  const handleDeleteAnnotations = useCallback(
    (id: ReactText) => {
      if (id === currentKeypointCollection?.id) {
        // when creating keypoint collections
        dispatch(deleteCollectionById(id.toString()));
      } else {
        dispatch(
          DeleteAnnotationsAndHandleLinkedAssetsOfFile({
            annotationIds: [+id],
            showWarnings: true,
          })
        );
      }
    },
    [currentKeypointCollection?.id]
  );

  const handleApprovalState = useCallback(
    async (id: ReactText, status: AnnotationStatus) => {
      if (id === currentKeypointCollection?.id) {
        // when creating keypoint collections
        dispatch(setCollectionStatus({ id: id.toString(), status }));
      } else {
        await dispatch(AnnotationStatusChange({ id: +id, status }));
      }
    },
    [currentKeypointCollection?.id]
  );

  const handleOnAnnotationSelect = useCallback(
    (id: ReactText, nextState: boolean) => {
      if (id === currentKeypointCollection?.id) {
        // when creating keypoint collections
        dispatch(deselectAllSelectionsReviewPage());
        if (nextState) {
          dispatch(selectCollection(id.toString()));
        }
      } else {
        dispatch(deselectAllSelectionsReviewPage());
        if (nextState) {
          dispatch(selectAnnotation(+id));
        }
      }
    },
    [currentKeypointCollection?.id]
  );

  const handleKeypointSelect = (id: ReactText) => {
    dispatch(keypointSelectStatusChange(id.toString()));
  };

  const ReviewCallbacks = {
    onDelete: handleDeleteAnnotations,
    onVisibilityChange: handleVisibility,
    onApproveStateChange: handleApprovalState,
    onSelect: handleOnAnnotationSelect,
    onKeypointSelect: handleKeypointSelect,
  };

  const annotationReviewData = useMemo(() => {
    return [
      {
        title: 'Linked assets',
        annotations: tagAnnotations,
        mode: VisionDetectionModelType.TagDetection,
        selected: selectedCategory === VisionDetectionModelType.TagDetection,
        component: TagAnnotationReviewRow as React.FC,
        emptyPlaceholder: 'No assets detected or manually added',
        ...ReviewCallbacks,
      },
      {
        title: 'Objects',
        annotations: objectAnnotations,
        mode: VisionDetectionModelType.ObjectDetection,
        selected: selectedCategory === VisionDetectionModelType.ObjectDetection,
        component: KeypointAnnotationReviewRow as React.FC,
        emptyPlaceholder: 'No text or objects detected or manually added',
        ...ReviewCallbacks,
      },
      {
        title: 'Text',
        annotations: textAnnotations,
        mode: VisionDetectionModelType.OCR,
        selected: selectedCategory === VisionDetectionModelType.OCR,
        component: AnnotationReviewRow as React.FC,
        emptyPlaceholder: 'No text or objects detected or manually added',
        ...ReviewCallbacks,
      },
    ];
  }, [tagAnnotations, textAnnotations, objectAnnotations, selectedCategory]);

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
        <VirtualizedAnnotationsReview
          childContainers={annotationReviewData}
          file={file}
        />
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
