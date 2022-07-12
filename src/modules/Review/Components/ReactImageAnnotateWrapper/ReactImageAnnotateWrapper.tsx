import React, {
  Dispatch,
  ReactText,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { selectAnnotation } from 'src/modules/Review/store/reviewSlice';
import {
  PredefinedKeypointCollection,
  PredefinedShape,
  PredefinedVisionAnnotations,
  TempKeypointCollection,
  VisionReviewAnnotation,
} from 'src/modules/Review/types';
import { Annotator, AnnotatorTool } from '@cognite/react-image-annotate';
import { retrieveDownloadUrl } from 'src/api/file/fileDownloadUrl';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { AnnotationEditPopup } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/AnnotationEditPopup/AnnotationEditPopup';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import {
  convertAnnotatorPointRegionToAnnotationChangeProperties,
  convertAnnotatorRegionToAnnotationChangeProperties,
  convertRegionToUnsavedVisionAnnotation,
  convertTempKeypointCollectionToRegions,
  convertVisionReviewAnnotationsToRegions,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/converters';
import { FileInfo, InternalId } from '@cognite/sdk';
import {
  UnsavedVisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  AnnotatorRegion,
  AnnotatorRegionLabelProps,
  isAnnotatorPointRegion,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import { AnnotationChangeById } from '@cognite/sdk-playground';
import {
  createTempKeypointCollection,
  deleteTempKeypointCollection,
  keypointSelectStatusChange,
  onCreateRegion,
  onUpdateKeyPoint,
  onUpdateRegion,
  setLastShape,
  setSelectedTool,
} from 'src/modules/Review/store/annotatorWrapper/slice';
import { useIsCurrentKeypointCollectionComplete } from 'src/modules/Review/store/annotatorWrapper/hooks';
import { convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection } from 'src/modules/Review/store/review/utils';
import { LegacyAnnotationUtils } from 'src/api/annotation/legacy/legacyAnnotationUtils';
import { tools } from './Tools';

type ReactImageAnnotateWrapperProps = {
  fileInfo: FileInfo;
  predefinedAnnotations: PredefinedVisionAnnotations;
  nextPredefinedKeypointCollection: PredefinedKeypointCollection;
  nextPredefinedShape: PredefinedShape;
  tempKeypointCollection: TempKeypointCollection | null;
  isLoading: (status: boolean) => void;
  focusIntoView: (id: ReactText) => void;
  // eslint-disable-next-line react/no-unused-prop-types
  onEditMode: (isEdit: boolean) => void; // todo: call this in edit mode to show border while in edit
  annotations: VisionReviewAnnotation<VisionAnnotationDataType>[];
  keepUnsavedRegion: boolean;
  selectedTool: string;
  scrollId: string;
  onCreateAnnotation: (
    annotation: Omit<
      UnsavedVisionAnnotation<VisionAnnotationDataType>,
      'annotatedResourceId'
    >
  ) => void;
  onUpdateAnnotation: (changes: AnnotationChangeById) => void;
  onDeleteAnnotation: (annotationId: InternalId) => void;
  openAnnotationSettings: (type: string, text?: string, color?: string) => void;
};

export const ReactImageAnnotateWrapper = ({
  fileInfo,
  annotations,
  predefinedAnnotations,
  nextPredefinedKeypointCollection,
  nextPredefinedShape,
  tempKeypointCollection,
  isLoading,
  focusIntoView,
  keepUnsavedRegion,
  selectedTool,
  scrollId,
  onUpdateAnnotation,
  onCreateAnnotation,
  onDeleteAnnotation,
  openAnnotationSettings,
}: ReactImageAnnotateWrapperProps) => {
  const dispatch: AppDispatch = useDispatch();
  const currentKeypointCollectionIsComplete =
    useIsCurrentKeypointCollectionComplete(fileInfo.id);

  const annotationEditPopupRef = useRef<HTMLDivElement | null>(null);
  const libDispatch = useRef<Dispatch<any> | null>(null);
  const [imageUrl, setImageUrl] = useState<string>();

  const regions = useMemo(() => {
    const currentCollectionAsRegions = convertTempKeypointCollectionToRegions(
      tempKeypointCollection
    );

    return [
      ...convertVisionReviewAnnotationsToRegions(annotations),
      ...currentCollectionAsRegions,
    ];
  }, [annotations, tempKeypointCollection]);

  const images = useMemo(() => {
    if (!imageUrl) {
      return [];
    }

    return [
      {
        src: imageUrl,
        name: fileInfo.name,
        regions,
      },
    ];
  }, [imageUrl, regions, fileInfo]);

  const collectionOptions = useMemo(() => {
    return predefinedAnnotations?.predefinedKeypointCollections.map(
      (keypoint) => ({
        value: keypoint.collectionName,
        label: keypoint.collectionName,
        icon: LegacyAnnotationUtils.getIconType({
          text: keypoint.collectionName,
          modelType: VisionDetectionModelType.ObjectDetection,
        }),
        color: keypoint.color,
      })
    );
  }, [predefinedAnnotations]);

  const shapeOptions = useMemo(() => {
    return predefinedAnnotations?.predefinedShapes.map((shape) => ({
      value: shape.shapeName,
      label: shape.shapeName,
      icon: LegacyAnnotationUtils.getIconType({
        text: shape.shapeName,
        modelType: VisionDetectionModelType.ObjectDetection,
      }),
      color: shape.color,
    }));
  }, [predefinedAnnotations]);

  const nextKeypoint = useMemo(() => {
    if (
      tempKeypointCollection?.remainingKeypoints &&
      tempKeypointCollection?.remainingKeypoints.length
    ) {
      return tempKeypointCollection?.remainingKeypoints[0];
    }
    return null;
  }, [tempKeypointCollection]);

  // if current keypoint collection is complete save it to CDF and remove state if not make it focus
  useEffect(() => {
    if (tempKeypointCollection && currentKeypointCollectionIsComplete) {
      const unsavedVisionImageKeypointCollectionAnnotation =
        convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection(
          tempKeypointCollection
        );
      if (unsavedVisionImageKeypointCollectionAnnotation) {
        onCreateAnnotation(unsavedVisionImageKeypointCollectionAnnotation);
        dispatch(deleteTempKeypointCollection());
      }
    }
  }, [
    tempKeypointCollection,
    currentKeypointCollectionIsComplete,
    onCreateAnnotation,
  ]);

  // if current keypoint collection is available and is not focused make it focused
  useEffect(() => {
    if (tempKeypointCollection && +scrollId !== tempKeypointCollection.id) {
      focusIntoView(tempKeypointCollection.id);
    }
  }, [tempKeypointCollection, scrollId]);

  useEffect(() => {
    (async () => {
      if (fileInfo && fileInfo.id) {
        const imgUrl = await retrieveDownloadUrl(fileInfo.id);
        if (imgUrl) {
          setImageUrl(imgUrl);
        } else {
          setImageUrl(undefined);
        }
      } else {
        setImageUrl(undefined);
      }
    })();
  }, [fileInfo]);

  // delete current collection when component is unmounted
  useEffect(() => {
    return () => {
      dispatch(deleteTempKeypointCollection());
    };
  }, []);

  useEffect(() => {
    dispatch(deleteTempKeypointCollection());
    dispatch(deselectAllSelectionsReviewPage());
  }, [fileInfo, selectedTool]);

  const handleCreateRegion = useCallback(
    async (region: AnnotatorRegion) => {
      const { annotationLabelOrText } = region;

      if (annotationLabelOrText) {
        if (isAnnotatorPointRegion(region)) {
          await dispatch(createTempKeypointCollection());
        } else {
          await dispatch(setLastShape(annotationLabelOrText));
          const unsavedAnnotation =
            convertRegionToUnsavedVisionAnnotation(region);
          if (unsavedAnnotation) {
            onCreateAnnotation(unsavedAnnotation);
          }
        }
      }
    },
    [onCreateAnnotation]
  );

  const handleUpdateRegion = useCallback(
    async (region: AnnotatorRegion) => {
      const { annotationLabelOrText } = region;

      if (annotationLabelOrText) {
        let annotationChangeProps;
        if (isAnnotatorPointRegion(region)) {
          await dispatch(onUpdateKeyPoint(region));
          annotationChangeProps =
            convertAnnotatorPointRegionToAnnotationChangeProperties(region);
        } else {
          await dispatch(setLastShape(annotationLabelOrText));
          annotationChangeProps =
            convertAnnotatorRegionToAnnotationChangeProperties(region);
        }
        if (annotationChangeProps) {
          onUpdateAnnotation(annotationChangeProps);
        }
      }
    },
    [onUpdateAnnotation]
  );

  const handleDeleteRegion = useCallback(
    (region: AnnotatorRegion) => {
      const annotationChangeProps =
        convertAnnotatorRegionToAnnotationChangeProperties(region);
      if (annotationChangeProps && annotationChangeProps.id) {
        onDeleteAnnotation({ id: annotationChangeProps.id });
      }
    },
    [onDeleteAnnotation]
  );

  const NewRegionEditLabel = useMemo(() => {
    return ({
      region,
      editing,
      onDelete,
      onClose,
      onChange,
    }: AnnotatorRegionLabelProps) => {
      /* eslint-disable react/prop-types */
      return (
        <AnnotationEditPopup
          region={region}
          editing={editing}
          onDelete={onDelete}
          onClose={onClose}
          onChange={onChange}
          onCreateRegion={handleCreateRegion}
          onUpdateRegion={handleUpdateRegion}
          onDeleteRegion={handleDeleteRegion}
          collectionOptions={collectionOptions}
          shapeOptions={shapeOptions}
          nextPredefinedShape={nextPredefinedShape}
          nextPredefinedKeypointCollection={nextPredefinedKeypointCollection}
          onOpenAnnotationSettings={openAnnotationSettings}
          nextKeypoint={nextKeypoint}
          popupReference={annotationEditPopupRef}
          predefinedAnnotations={predefinedAnnotations}
        />
      );
      /* eslint-enable react/prop-types */
    };
  }, [
    handleCreateRegion,
    handleUpdateRegion,
    handleDeleteRegion,
    collectionOptions,
    shapeOptions,
    nextPredefinedShape,
    nextPredefinedKeypointCollection,
    openAnnotationSettings,
    nextKeypoint,
    predefinedAnnotations,
  ]);

  /**
   * Focus annotation in side panel when region is selected
   */
  /* eslint-disable react/prop-types */
  const onRegionSelect = useCallback(
    (region: AnnotatorRegion) => {
      dispatch(deselectAllSelectionsReviewPage());
      let selectedAnnotationId: ReactText;
      // keypoint regions will have a string id
      if (isAnnotatorPointRegion(region)) {
        // eslint-disable-next-line react/prop-types
        dispatch(keypointSelectStatusChange(String(region.id)));
        selectedAnnotationId = region.parentAnnotationId;
      } else {
        dispatch(selectAnnotation(+region.id));
        selectedAnnotationId = +region.id;
      }
      if (selectedAnnotationId) {
        let annotationId = annotations.find(
          (ann) => ann.annotation.id === +selectedAnnotationId
        )?.annotation?.id;
        if (!annotationId && tempKeypointCollection) {
          annotationId = tempKeypointCollection.id;
        }
        if (annotationId) {
          focusIntoView(annotationId);
        }
      }
    },
    [focusIntoView, tempKeypointCollection, annotations]
  );
  /* eslint-enable react/prop-types */

  const deselectAllRegionHandler = useCallback(() => {
    dispatch(deselectAllSelectionsReviewPage());
  }, []);

  const toolChangeHandler = useCallback((tool: AnnotatorTool) => {
    dispatch(setSelectedTool(tool));
  }, []);

  const imageOrVideoLoadedHandler = useCallback(() => {
    isLoading(false);
  }, [isLoading]);

  const regionCreateHandler = useCallback((region: AnnotatorRegion) => {
    dispatch(onCreateRegion(region));
  }, []);

  const regionUpdateHandler = useCallback((region: AnnotatorRegion) => {
    dispatch(onUpdateRegion(region));
  }, []);

  const dispatchObjectReceiveHandler = useCallback(
    (dispatchObj: Dispatch<any>) => {
      libDispatch.current = dispatchObj;
    },
    []
  );

  const enabledTools = useMemo(() => {
    return Object.values(tools);
  }, [tools]);

  return (
    <Container>
      <MemoizedAnnotator
        onExit={() => {}}
        hideHeader
        images={images}
        enabledTools={enabledTools}
        RegionEditLabel={NewRegionEditLabel}
        showTags
        selectedTool={selectedTool}
        keepUnsavedRegions={keepUnsavedRegion}
        onSelectRegion={onRegionSelect}
        deSelectAllRegions={deselectAllRegionHandler}
        onSelectTool={toolChangeHandler}
        onImageOrVideoLoaded={imageOrVideoLoadedHandler}
        onRegionCreated={regionCreateHandler}
        onRegionUpdated={regionUpdateHandler}
        onInitDispatch={dispatchObjectReceiveHandler}
      />
    </Container>
  );
};

export const MemoizedAnnotator = React.memo(Annotator);

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  .MuiIconButton-colorPrimary {
    color: #3f51b5;
  }
`;
