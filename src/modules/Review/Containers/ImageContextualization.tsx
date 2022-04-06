import React, {
  ReactText,
  Reducer,
  useCallback,
  useMemo,
  useReducer,
} from 'react';
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
import { convertKeyPointCollectionToAnnotationStub } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ConversionUtils';
import { TagAnnotationReviewRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/TagAnnotationReviewRow';
import { KeypointAnnotationReviewRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/KeypointAnnotationReviewRow';
import { AnnotationReviewRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/AnnotationReviewRow';
import { VirtualizedAnnotationsReview } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/VirtualizedAnnotationsReview';
import { ReviewAnnotation } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/types';
import { generateNodeTree } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/generateNodeTree';

export enum Categories {
  Asset = 'Asset tags',
  Object = 'Objects',
  Text = 'Text',
  KeypointCollections = 'Keypoint collections',
  Classifications = 'Classification tags',
}

type CategoryState = {
  [index in Categories]?: { selected: boolean };
};

const categories: CategoryState = {};

const initialCategoriesState: {
  categories: CategoryState;
} = { categories };

const reducer: Reducer<
  {
    categories: CategoryState;
  },
  { type: string; payload: { category: Categories; selected: boolean } }
> = (state, action) => {
  switch (action.type) {
    case 'selectCategory': {
      if (
        action?.payload?.category &&
        action?.payload?.selected !== undefined
      ) {
        return {
          ...state,
          categories: {
            ...state.categories,
            [action.payload.category]: {
              selected: action.payload.selected,
            },
          },
        };
      }
      return {
        ...state,
      };
    }
    default: {
      return {
        ...state,
      };
    }
  }
};

export const ImageContextualization = (props: {
  file: FileInfo;
  reference: any;
}) => {
  const { file } = props;

  const dispatch = useDispatch();
  const [categoryState, categoryDispatch] = useReducer(
    reducer,
    initialCategoriesState
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
      currentCollection(annotationLabelReducer)
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

  const handleOnSelect = useCallback(
    (id: ReactText, nextState: boolean) => {
      if (id === currentKeypointCollection?.id) {
        // when creating keypoint collections
        dispatch(deselectAllSelectionsReviewPage());
        if (nextState) {
          dispatch(selectCollection(id.toString()));
        }
      } else if (Object.values(Categories).includes(id as Categories)) {
        categoryDispatch({
          type: 'selectCategory',
          payload: { category: id as Categories, selected: nextState },
        });
      } else {
        dispatch(deselectAllSelectionsReviewPage());
        if (nextState) {
          dispatch(selectAnnotation(+id));
        }
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

  // items in common section will be passed down to child items
  const annotationReviewCategories = useMemo(() => {
    const annotationCategories = [
      {
        title: Categories.Asset,
        selected: !!categoryState.categories[Categories.Asset]?.selected,
        emptyPlaceholder: 'No assets detected or manually added',
        common: {
          annotations: tagAnnotations,
          mode: VisionDetectionModelType.TagDetection,
          component: TagAnnotationReviewRow as React.FC,
        },
      },
      {
        title: Categories.Object,
        selected: !!categoryState.categories[Categories.Object]?.selected,
        emptyPlaceholder: 'No objects detected or manually added',
        common: {
          annotations: objectAnnotations,
          mode: VisionDetectionModelType.ObjectDetection,
          component: KeypointAnnotationReviewRow as React.FC,
        },
      },
      {
        title: Categories.Text,
        selected: !!categoryState.categories[Categories.Text]?.selected,
        emptyPlaceholder: 'No text or objects detected or manually added',
        common: {
          annotations: textAnnotations,
          mode: VisionDetectionModelType.OCR,
          component: AnnotationReviewRow as React.FC,
        },
      },
      {
        title: Categories.KeypointCollections,
        selected:
          !!categoryState.categories[Categories.KeypointCollections]?.selected,
        emptyPlaceholder: 'No keypoints detected or manually added',
        common: {
          annotations: keyPointAnnotations,
          mode: VisionDetectionModelType.ObjectDetection,
          component: KeypointAnnotationReviewRow as React.FC,
        },
      },
      {
        title: Categories.Classifications,
        selected:
          !!categoryState.categories[Categories.Classifications]?.selected,
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
