import React, {
  Dispatch,
  ReactText,
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
import {
  Annotator,
  AnnotatorTool,
  Action,
  MainLayoutState,
} from '@cognite/react-image-annotate';
import { retrieveDownloadUrl } from 'src/api/file/fileDownloadUrl';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { AnnotationEditPopup } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/AnnotationEditPopup/AnnotationEditPopup';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import {
  convertAnnotatorPointRegionToAnnotationChangeProperties,
  convertRegionToVisionAnnotationProperties,
  convertTempKeypointCollectionToRegions,
  convertVisionReviewAnnotationsToRegions,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/converters';
import { FileInfo } from '@cognite/sdk';
import {
  UnsavedVisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  AnnotatorRegion,
  isAnnotatorPointRegion,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import { AnnotationUtilsV1 } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { AnnotationChangeById } from '@cognite/sdk-playground';
import {
  deleteCurrentCollection,
  keypointSelectStatusChange,
  onCreateKeyPoint,
  onUpdateKeyPoint,
  setLastShape,
  setSelectedTool,
} from 'src/modules/Review/store/annotatorWrapper/slice';
import { useIsCurrentKeypointCollectionComplete } from 'src/modules/Review/store/annotatorWrapper/hooks';
import { convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection } from 'src/modules/Review/store/review/utils';
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
    annotation: UnsavedVisionAnnotation<VisionAnnotationDataType>
  ) => void;
  onUpdateAnnotation: (changes: AnnotationChangeById) => void;
  onDeleteAnnotation: (
    annotation: VisionReviewAnnotation<VisionAnnotationDataType>
  ) => void;
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

  const [tempRegion, setTempRegion] = useState<AnnotatorRegion | null>(null);
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

  const nextKeypoint = useMemo(() => {
    if (
      tempKeypointCollection?.remainingKeypoints &&
      tempKeypointCollection?.remainingKeypoints.length
    ) {
      return tempKeypointCollection?.remainingKeypoints[0];
    }
    return null;
  }, [tempKeypointCollection]);

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

  const collectionOptions =
    predefinedAnnotations?.predefinedKeypointCollections.map((keypoint) => ({
      value: keypoint.collectionName,
      label: keypoint.collectionName,
      icon: AnnotationUtilsV1.getIconType({
        text: keypoint.collectionName,
        modelType: VisionDetectionModelType.ObjectDetection,
      }),
      color: AnnotationUtilsV1.getAnnotationColor(
        keypoint.collectionName,
        VisionDetectionModelType.ObjectDetection,
        { keypoint: true }
      ),
    }));
  const shapeOptions = predefinedAnnotations?.predefinedShapes.map((shape) => ({
    value: shape.shapeName,
    label: shape.shapeName,
    icon: AnnotationUtilsV1.getIconType({
      text: shape.shapeName,
      modelType: VisionDetectionModelType.ObjectDetection,
    }),
    color: shape.color,
  }));

  // if current keypoint collection is complete save it to CDF and remove state if not make it focus
  useEffect(() => {
    if (tempKeypointCollection && currentKeypointCollectionIsComplete) {
      const unsavedVisionImageKeypointCollectionAnnotation =
        convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection(
          tempKeypointCollection
        );
      if (unsavedVisionImageKeypointCollectionAnnotation) {
        onCreateAnnotation(unsavedVisionImageKeypointCollectionAnnotation);
        dispatch(deleteCurrentCollection());
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
      dispatch(deleteCurrentCollection());
    };
  }, []);

  useEffect(() => {
    dispatch(deleteCurrentCollection());
    dispatch(deselectAllSelectionsReviewPage());
  }, [fileInfo, selectedTool]);

  // todo: use useCallback
  const handleCreateRegion = async (region: AnnotatorRegion) => {
    const { annotationLabelOrText } = region;

    if (annotationLabelOrText) {
      if (isAnnotatorPointRegion(region)) {
        await dispatch(onCreateKeyPoint(region));
      } else {
        await dispatch(setLastShape(annotationLabelOrText));
        onCreateAnnotation(convertRegionToVisionAnnotationProperties(region));
      }
    }
  };

  // todo: use useCallback
  const handleUpdateRegion = async (region: AnnotatorRegion) => {
    const { annotationLabelOrText } = region;

    if (annotationLabelOrText) {
      if (isAnnotatorPointRegion(region)) {
        await dispatch(onUpdateKeyPoint(region));
        // check for availability of CDF annotation id
        if (region.parentAnnotationId && region.annotationMeta) {
          onUpdateAnnotation(
            convertAnnotatorPointRegionToAnnotationChangeProperties(region)
          );
        }
      } else {
        await dispatch(setLastShape(annotationLabelOrText));
        onUpdateAnnotation(convertRegionToVisionAnnotationProperties(region));
      }
    }
  };

  // use useCallback
  const handleDeleteRegion = (region: AnnotatorRegion) => {
    onDeleteAnnotation(convertRegionToVisionAnnotationProperties(region));
  };

  const NewRegionEditLabel = useMemo(() => {
    return ({
      region,
      editing,
      onDelete,
      onClose,
      onChange,
    }: {
      region: AnnotatorRegion;
      editing: boolean;
      onDelete: (region: AnnotatorRegion) => void;
      onClose: (region: AnnotatorRegion) => void;
      onChange: (region: AnnotatorRegion) => void;
    }) => {
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
        />
      );
      /* eslint-enable react/prop-types */
    };
  }, [
    onCreateAnnotation,
    onUpdateAnnotation,
    predefinedAnnotations,
    nextPredefinedShape,
  ]);

  /* eslint-disable react/prop-types */
  const onRegionSelect = (region: AnnotatorRegion) => {
    dispatch(deselectAllSelectionsReviewPage());
    let selectedAnnotationId: ReactText;
    // keypoint regions will have a string id
    if (isAnnotatorPointRegion(region)) {
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
  };
  /* eslint-enable react/prop-types */

  const deselectAllRegions = () => {
    dispatch(deselectAllSelectionsReviewPage());
  };

  const onToolChange = (tool: AnnotatorTool) => {
    dispatch(setSelectedTool(tool));
  };

  const onImageOrVideoLoaded = () => {
    isLoading(false);
  };

  // todo: use hotkeys implementation once https://github.com/greena13/react-hotkeys/issues/237 is fixed
  const onKeyPressSubmit = (evt: Partial<KeyboardEvent>) => {
    if (evt.key === 'Enter') {
      if (annotationEditPopupRef.current) {
        const submitBtn = annotationEditPopupRef.current?.querySelector(
          '.annotation-submit-btn'
        ) as HTMLButtonElement;
        if (submitBtn) {
          submitBtn.focus();
          submitBtn.click();
        }
      }
    }
  };

  const onCreateRegion = (region: AnnotatorRegion) => {
    setTempRegion(region);
  };

  const onInitDispatch = (dispatchObj: Dispatch<any>) => {
    libDispatch.current = dispatchObj;
  };

  const onCallDispatch = (action: Action, state: MainLayoutState) => {
    if (libDispatch.current) {
      if (action.type === 'MOUSE_DOWN') {
        if (tempRegion && state.mode === null && !keepUnsavedRegion) {
          // delete temporary regions on mouse click if not saved in CDF
          libDispatch.current({
            type: 'DELETE_REGION',
            region: tempRegion,
          });
        }
      }
    }
  };

  return (
    <Container onKeyPress={onKeyPressSubmit}>
      <Annotator
        onExit={() => {}}
        hideHeader
        images={images}
        keypointDefinitions={{}}
        enabledTools={Object.values(tools)}
        RegionEditLabel={NewRegionEditLabel}
        showTags
        onSelectRegion={onRegionSelect}
        deSelectAllRegions={deselectAllRegions}
        onSelectTool={onToolChange}
        selectedTool={selectedTool}
        onImageOrVideoLoaded={onImageOrVideoLoaded}
        onRegionCreated={onCreateRegion}
        onCallDispatch={onCallDispatch}
        onInitDispatch={onInitDispatch}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  .MuiIconButton-colorPrimary {
    color: #3f51b5;
  }
`;
