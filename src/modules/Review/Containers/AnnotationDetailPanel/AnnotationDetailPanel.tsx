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
import { AnnotationStatusChangeV1 } from 'src/store/thunks/Annotation/AnnotationStatusChangeV1';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFileV1 } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFileV1';
import styled from 'styled-components';
import { RootState } from 'src/store/rootReducer';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { useDispatch, useSelector } from 'react-redux';
import { FileInfo } from '@cognite/sdk';
import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { generateNodeTree } from 'src/modules/Review/Containers/AnnotationDetailPanel/utils/generateNodeTree';
import { Categories } from 'src/modules/Review/types';
import {
  AnnotationReviewRow,
  KeypointAnnotationReviewRow,
  TagAnnotationReviewRow,
  VirtualizedAnnotationsReview,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components';
import { AnnotationDetailPanelHotKeys } from 'src/modules/Review/Containers/AnnotationDetailPanel/AnnotationDetailPanelHotKeys';
import { ReviewAnnotation } from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import { selectCategory } from 'src/modules/Review/Containers/AnnotationDetailPanel/store/slice';
import { convertKeyPointCollectionToAnnotationStub } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ConversionUtilsV1';

export const AnnotationDetailPanel = (props: {
  file: FileInfo;
  reference: any;
}) => {
  const { file } = props;

  const dispatch = useDispatch();
  const categoryState = useSelector(
    (state: RootState) => state.annotationDetailPanelReducer.categories
  );

  // when set virtualized tree component will use this to automatically scroll to position
  const scrollId = useSelector(
    (rootState: RootState) => rootState.reviewSlice.scrollToId
  );

  const visibleAnnotations = useSelector((rootState: RootState) =>
    selectVisibleAnnotationsForFile(rootState, file.id)
  );

  const currentKeypointCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      currentCollection(annotationLabelReducer, file.id)
  );

  const tagAnnotations = useMemo(() => {
    return visibleAnnotations.filter(
      (annotation) =>
        annotation.modelType === VisionDetectionModelType.TagDetection
    );
  }, [visibleAnnotations]);

  const objectAnnotations = useMemo(() => {
    return visibleAnnotations.filter(
      (annotation) =>
        annotation.modelType === VisionDetectionModelType.ObjectDetection &&
        !annotation?.data?.keypoint
    ) as ReviewAnnotation[];
  }, [visibleAnnotations]);

  const keyPointAnnotations = useMemo(() => {
    const savedKeypointAnnotations = visibleAnnotations.filter(
      (annotation) => !!annotation?.data?.keypoint
    ) as ReviewAnnotation[];
    if (currentKeypointCollection) {
      return savedKeypointAnnotations.concat([
        {
          ...convertKeyPointCollectionToAnnotationStub(
            currentKeypointCollection
          ),
        },
      ]);
    }
    return savedKeypointAnnotations;
  }, [visibleAnnotations, currentKeypointCollection]);

  const textAnnotations = useMemo(() => {
    return visibleAnnotations.filter(
      (annotation) => annotation.modelType === VisionDetectionModelType.OCR
    );
  }, [visibleAnnotations]);

  const classificationAnnotations = useMemo(() => {
    return visibleAnnotations.filter((annotation) => !annotation.region);
  }, [visibleAnnotations]);

  const [mode, isKeypoint] = useMemo(() => {
    const selectedAnnotation = visibleAnnotations.find(
      (annotation) => annotation.selected
    );

    if (selectedAnnotation) {
      return [selectedAnnotation.modelType, selectedAnnotation?.data?.keypoint];
    }
    return [0, false];
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

  const handleDelete = useCallback(
    (id: ReactText) => {
      if (id === currentKeypointCollection?.id) {
        // when creating keypoint collections
        dispatch(deleteCollectionById(id.toString()));
      } else {
        dispatch(
          DeleteAnnotationsAndHandleLinkedAssetsOfFileV1({
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
        await dispatch(AnnotationStatusChangeV1({ id: +id, status }));
      }
    },
    [currentKeypointCollection?.id]
  );

  const handleOnSelect = useCallback(
    (id: ReactText, nextState: boolean) => {
      dispatch(deselectAllSelectionsReviewPage());
      if (id === currentKeypointCollection?.id) {
        // when creating keypoint collections
        if (nextState) {
          dispatch(selectCollection(id.toString()));
        }
      } else if (Object.values(Categories).includes(id as Categories)) {
        dispatch(
          selectCategory({ category: id as Categories, selected: nextState })
        );
      } else if (nextState) {
        dispatch(selectAnnotation(+id));
      }
    },
    [currentKeypointCollection?.id]
  );

  const handleKeypointSelect = useCallback((id: ReactText) => {
    dispatch(keypointSelectStatusChange(id.toString()));
  }, []);

  const ReviewCallbacks = useMemo(
    () => ({
      onDelete: handleDelete,
      onVisibilityChange: handleVisibility,
      onApproveStateChange: handleApprovalState,
      onSelect: handleOnSelect,
      onKeypointSelect: handleKeypointSelect,
    }),
    [
      handleDelete,
      handleVisibility,
      handleApprovalState,
      handleOnSelect,
      handleKeypointSelect,
    ]
  );

  // todo: map categories to annotation types from a functions and remove these hardcoded categories - VIS-803
  const annotationReviewCategories = useMemo(() => {
    // items in common section will be passed down to child items
    const annotationCategories = [
      {
        title: Categories.Asset,
        selected: !!categoryState[Categories.Asset]?.selected,
        emptyPlaceholder: 'No assets detected or manually added',
        common: {
          annotations: tagAnnotations,
          mode: VisionDetectionModelType.TagDetection,
          component: TagAnnotationReviewRow as React.FC,
        },
      },
      {
        title: Categories.Object,
        selected: !!categoryState[Categories.Object]?.selected,
        emptyPlaceholder: 'No objects detected or manually added',
        common: {
          annotations: objectAnnotations,
          mode: VisionDetectionModelType.ObjectDetection,
          component: KeypointAnnotationReviewRow as React.FC,
        },
      },
      {
        title: Categories.Text,
        selected: !!categoryState[Categories.Text]?.selected,
        emptyPlaceholder: 'No text or objects detected or manually added',
        common: {
          annotations: textAnnotations,
          mode: VisionDetectionModelType.OCR,
          component: AnnotationReviewRow as React.FC,
        },
      },
      {
        title: Categories.KeypointCollections,
        selected: !!categoryState[Categories.KeypointCollections]?.selected,
        emptyPlaceholder: 'No keypoints detected or manually added',
        common: {
          annotations: keyPointAnnotations,
          mode: VisionDetectionModelType.ObjectDetection,
          component: KeypointAnnotationReviewRow as React.FC,
        },
      },
      {
        title: Categories.Classifications,
        selected: !!categoryState[Categories.Classifications]?.selected,
        emptyPlaceholder: 'No classifications detected or manually added',
        common: {
          annotations: classificationAnnotations,
          mode: VisionDetectionModelType.ObjectDetection,
          component: KeypointAnnotationReviewRow as React.FC,
        },
      },
    ];

    // filters categories of empty annotations
    return annotationCategories
      .filter((category) => !!category.common.annotations.length)
      .map((category) => ({
        ...category,
        common: { ...category.common, file }, // add file to common props
      }));
  }, [
    tagAnnotations,
    textAnnotations,
    objectAnnotations,
    mode,
    isKeypoint,
    keyPointAnnotations,
    categoryState,
  ]);

  const rootNodeArr = useMemo(
    () =>
      annotationReviewCategories.map((category) =>
        generateNodeTree({ ...category, callbacks: ReviewCallbacks })
      ),
    [annotationReviewCategories]
  );

  return (
    <AnnotationDetailPanelHotKeys
      nodeTree={rootNodeArr}
      scrollId={scrollId}
      file={file}
    >
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
            rootNodeArr={rootNodeArr}
            scrollId={scrollId}
          />
        </TableContainer>
      </Container>
    </AnnotationDetailPanelHotKeys>
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
  border: 1px solid #d9d9d9;
  border-radius: 4px;
`;
