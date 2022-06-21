import React, { ReactText, useCallback, useMemo } from 'react';
import { Detail, Icon, PrimaryTooltip } from '@cognite/cogs.js';
import {
  selectAnnotation,
  toggleAnnotationVisibility,
  selectVisionReviewAnnotationsForFile,
} from 'src/modules/Review/store/reviewSlice';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import styled from 'styled-components';
import { RootState } from 'src/store/rootReducer';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { batch, useDispatch, useSelector } from 'react-redux';
import { FileInfo } from '@cognite/sdk';
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
  Status,
} from 'src/api/annotation/types';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import {
  isImageAssetLinkData,
  isImageClassificationData,
  isImageExtractedTextData,
  isImageKeypointCollectionData,
  isImageObjectDetectionData,
} from 'src/modules/Common/types/typeGuards';
import { convertTempKeypointCollectionToVisionReviewImageKeypointCollection } from 'src/modules/Review/store/review/utils';
import { AnnotationStatusChange } from 'src/store/thunks/Annotation/AnnotationStatusChange';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import {
  deleteCurrentCollection,
  keypointSelectStatusChange,
  selectCollection,
  setCollectionStatus,
  toggleCollectionVisibility,
} from 'src/modules/Review/store/annotatorWrapper/slice';
import {
  AnnotationDetailPanelAnnotationType,
  AnnotationDetailPanelRowDataBase,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import { selectTempKeypointCollection } from 'src/modules/Review/store/annotatorWrapper/selectors';

export const AnnotationDetailPanel = (props: { file: FileInfo }) => {
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

  const tempKeypointCollection = useSelector(
    ({ annotatorWrapperReducer, annotationReducer }: RootState) =>
      selectTempKeypointCollection(annotatorWrapperReducer, {
        currentFileId: file.id,
        annotationColorMap: annotationReducer.annotationColorMap,
      })
  );

  const convertedCurrentKeypointCollection: VisionReviewAnnotation<ImageKeypointCollection> | null =
    convertTempKeypointCollectionToVisionReviewImageKeypointCollection(
      tempKeypointCollection
    );

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
  }, [visibleReviewAnnotations, tempKeypointCollection]);

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
      if (id === tempKeypointCollection?.id) {
        // when creating keypoint collections
        dispatch(toggleCollectionVisibility(id));
      } else {
        dispatch(
          toggleAnnotationVisibility({
            annotationId: +id,
          })
        );
      }
    },
    [tempKeypointCollection?.id]
  );

  const handleDelete = useCallback(
    (id: number) => {
      if (id === tempKeypointCollection?.id) {
        // when creating keypoint collections
        dispatch(deleteCurrentCollection());
      } else {
        dispatch(
          DeleteAnnotationsAndHandleLinkedAssetsOfFile({
            annotationId: { id },
            showWarnings: true,
          })
        );
      }
    },
    [tempKeypointCollection?.id]
  );

  const handleApprovalState = useCallback(
    async (id: number, status: Status) => {
      if (id === tempKeypointCollection?.id) {
        // when creating keypoint collections
        dispatch(setCollectionStatus({ id, status }));
      } else {
        await dispatch(AnnotationStatusChange({ id, status }));
      }
    },
    [tempKeypointCollection?.id]
  );

  const handleOnSelect = useCallback(
    (id: ReactText, nextState: boolean) => {
      batch(() => {
        dispatch(deselectAllSelectionsReviewPage());
        if (id === tempKeypointCollection?.id) {
          // when creating keypoint collections
          if (nextState) {
            dispatch(selectCollection(id));
          }
        } else if (Object.values(Categories).includes(id as Categories)) {
          dispatch(
            selectCategory({ category: id as Categories, selected: nextState })
          );
        } else if (nextState) {
          dispatch(selectAnnotation(+id));
        }
      });
    },
    [tempKeypointCollection?.id]
  );

  const handleKeypointSelect = useCallback((id: string) => {
    dispatch(keypointSelectStatusChange(id));
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
