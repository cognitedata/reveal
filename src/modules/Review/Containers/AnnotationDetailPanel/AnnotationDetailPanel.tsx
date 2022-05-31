import React, { ReactText, useCallback, useMemo } from 'react';
import { Detail, Icon, PrimaryTooltip } from '@cognite/cogs.js';
import {
  deleteCollectionById,
  keypointSelectStatusChange,
  selectCollection,
  setCollectionStatus,
  toggleCollectionVisibility,
} from 'src/modules/Review/store/annotationLabel/slice';
import { currentCollection } from 'src/modules/Review/store/annotatorWrapper/selectors';
import {
  selectAnnotation,
  toggleAnnotationVisibility,
  selectVisionReviewAnnotationsForFile,
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
import { Categories, VisionReviewAnnotation } from 'src/modules/Review/types';
import {
  ReviewVisionAnnotationRow,
  ReviewAssetLinkAnnotationRow,
  VirtualizedReviewAnnotations,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components';
import { AnnotationDetailPanelHotKeys } from 'src/modules/Review/Containers/AnnotationDetailPanel/AnnotationDetailPanelHotKeys';
import { selectCategory } from 'src/modules/Review/Containers/AnnotationDetailPanel/store/slice';
import {
  CDFAnnotationTypeEnum,
  ImageKeypointCollection,
} from 'src/api/annotation/types';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import {
  isImageAssetLinkData,
  isImageClassificationData,
  isImageExtractedTextData,
  isImageKeypointCollectionData,
  isImageObjectDetectionData,
} from 'src/modules/Common/types/typeGuards';
import {
  AnnotationDetailPanelAnnotationType,
  AnnotationDetailPanelRowDataBase,
} from './types';

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

  const visibleReviewAnnotations: VisionReviewAnnotation<VisionAnnotationDataType>[] =
    useSelector((rootState: RootState) =>
      selectVisionReviewAnnotationsForFile(rootState, file.id)
    );

  const currentKeypointCollection = useSelector(
    ({ annotatorWrapperReducer }: RootState) =>
      currentCollection(annotatorWrapperReducer, file.id)
  );

  const convertedCurrentKeypointCollection: VisionReviewAnnotation<ImageKeypointCollection> | null =
    currentKeypointCollection && {
      annotation: {
        annotatedResourceId: currentKeypointCollection.annotatedResourceId,
        status: currentKeypointCollection.status,
        annotationType: CDFAnnotationTypeEnum.ImagesKeypointCollection,
        label: currentKeypointCollection.label,
        keypoints: currentKeypointCollection.keypoints,
        createdTime: 0,
        lastUpdatedTime: 0,
        /**
         * @todo: The currentCollection selector in AnnotationWrapper should use numeric
         * id for the collection, which can correspond to annotation id from CDF or
         * in case on unsaved collection a random numeric value.
         * @see createUniqueNumericId
         *
         * Once this has been done we need update the code other places
         * accordingly.
         */
        id: Number(currentKeypointCollection.id),
      },
      show: currentKeypointCollection.show,
      selected: currentKeypointCollection.selected,
    };

  const imagesAssetLinkReviewAnnotations = useMemo(() => {
    return visibleReviewAnnotations.filter((reviewAnnotation) =>
      isImageAssetLinkData(reviewAnnotation.annotation)
    );
  }, [visibleReviewAnnotations]);

  const imagesObjectReviewAnnotations = useMemo(() => {
    return visibleReviewAnnotations.filter((reviewAnnotation) =>
      isImageObjectDetectionData(reviewAnnotation.annotation)
    );
  }, [visibleReviewAnnotations]);

  const imagesKeypointCollectionReviewAnnotations = useMemo(() => {
    const savedKeypointAnnotations = visibleReviewAnnotations.filter(
      (reviewAnnotation) =>
        isImageKeypointCollectionData(reviewAnnotation.annotation)
    );
    if (convertedCurrentKeypointCollection) {
      return savedKeypointAnnotations.concat([
        {
          ...convertedCurrentKeypointCollection,
        },
      ]);
    }
    return savedKeypointAnnotations;
  }, [visibleReviewAnnotations, currentKeypointCollection]);

  const imagesTextRegionReviewAnnotations = useMemo(() => {
    return visibleReviewAnnotations.filter((reviewAnnotation) =>
      isImageExtractedTextData(reviewAnnotation.annotation)
    );
  }, [visibleReviewAnnotations]);

  const imagesClassificationReviewAnnotations = useMemo(() => {
    return visibleReviewAnnotations.filter((reviewAnnotation) =>
      isImageClassificationData(reviewAnnotation.annotation)
    );
  }, [visibleReviewAnnotations]);

  const [mode, isKeypoint] = useMemo(() => {
    const selectedAnnotation = visibleReviewAnnotations.find(
      (annotation) => annotation.selected
    );

    if (selectedAnnotation) {
      return [
        selectedAnnotation.annotation.annotationType,
        selectedAnnotation.annotation.annotationType ===
          CDFAnnotationTypeEnum.ImagesKeypointCollection,
      ];
    }
    return [0, false];
  }, [visibleReviewAnnotations]);

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
  const categoryRowDataList: AnnotationDetailPanelRowDataBase<AnnotationDetailPanelAnnotationType>[] =
    useMemo(() => {
      // items in common section will be passed down to child items
      const rowData = [
        {
          title: Categories.Asset,
          selected: !!categoryState[Categories.Asset]?.selected,
          emptyPlaceholder: 'No assets detected or manually added',
          callbacks: ReviewCallbacks,
          common: {
            reviewAnnotations: imagesAssetLinkReviewAnnotations,
            mode: VisionDetectionModelType.TagDetection,
            component: ReviewAssetLinkAnnotationRow as React.FC,
          },
        },
        {
          title: Categories.Object,
          selected: !!categoryState[Categories.Object]?.selected,
          emptyPlaceholder: 'No objects detected or manually added',
          callbacks: ReviewCallbacks,
          common: {
            reviewAnnotations: imagesObjectReviewAnnotations,
            mode: VisionDetectionModelType.ObjectDetection,
            component: ReviewVisionAnnotationRow as React.FC,
          },
        },
        {
          title: Categories.Text,
          selected: !!categoryState[Categories.Text]?.selected,
          emptyPlaceholder: 'No text or objects detected or manually added',
          callbacks: ReviewCallbacks,
          common: {
            reviewAnnotations: imagesTextRegionReviewAnnotations,
            mode: VisionDetectionModelType.OCR,
            component: ReviewVisionAnnotationRow as React.FC,
          },
        },
        {
          title: Categories.KeypointCollections,
          selected: !!categoryState[Categories.KeypointCollections]?.selected,
          emptyPlaceholder: 'No keypoints detected or manually added',
          callbacks: ReviewCallbacks,
          common: {
            reviewAnnotations: imagesKeypointCollectionReviewAnnotations,
            mode: VisionDetectionModelType.ObjectDetection,
            component: ReviewVisionAnnotationRow as React.FC,
          },
        },
        {
          title: Categories.Classifications,
          selected: !!categoryState[Categories.Classifications]?.selected,
          emptyPlaceholder: 'No classifications detected or manually added',
          callbacks: ReviewCallbacks,
          common: {
            reviewAnnotations: imagesClassificationReviewAnnotations,
            mode: VisionDetectionModelType.ObjectDetection,
            component: ReviewVisionAnnotationRow as React.FC,
          },
        },
      ];

      // filters categories of empty annotations
      return rowData
        .filter((category) => !!category.common.reviewAnnotations.length)
        .map((category) => ({
          ...category,
          common: { ...category.common, file }, // add file to common props
        }));
    }, [
      imagesAssetLinkReviewAnnotations,
      imagesTextRegionReviewAnnotations,
      imagesObjectReviewAnnotations,
      mode,
      isKeypoint,
      imagesKeypointCollectionReviewAnnotations,
      categoryState,
    ]);

  const rootNodeArr = useMemo(
    () => categoryRowDataList.map((category) => generateNodeTree(category)),
    [categoryRowDataList]
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
          <VirtualizedReviewAnnotations
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
