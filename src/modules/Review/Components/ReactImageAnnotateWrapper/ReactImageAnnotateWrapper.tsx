import React, { ReactText, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteCurrentCollection,
  keypointSelectStatusChange,
  onCreateKeyPoint,
  onCreateOrUpdateShape,
  onUpdateKeyPoint,
} from 'src/modules/Review/store/annotationLabelSlice';
import { selectAnnotation } from 'src/modules/Review/store/reviewSlice';
import {
  AnnotationTableItem,
  ReactImageAnnotateWrapperProps,
} from 'src/modules/Review/types';
import {
  Annotator,
  Region,
  AnnotatorTool,
} from '@cognite/react-image-annotate';
import { retrieveDownloadUrl } from 'src/api/file/fileDownloadUrl';
import { AnnotationEditPopup } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/AnnotationEditPopup';
import {
  convertAnnotations,
  convertCollectionToRegions,
  convertKeyPointCollectionToAnnotationStub,
  convertToAnnotation,
  RegionTagsIndex,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ConversionUtils';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { CreateKeypointAnnotation } from 'src/store/thunks/Annotation/CreateKeypointAnnotation';
import { RetrieveKeypointCollection } from 'src/store/thunks/Review/RetrieveKeypointCollection';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { AppDispatch } from 'src/store';
import { tools } from './Tools';

export const ReactImageAnnotateWrapper = ({
  onUpdateAnnotation,
  onCreateAnnotation,
  onDeleteAnnotation,
  annotations,
  fileInfo,
  predefinedLabels,
  nextToDoKeypointInCurrentCollection,
  lastShapeName,
  lastKeypointCollection,
  currentKeypointCollection,
  isLoading,
  selectedTool,
  onSelectTool,
  focusIntoView,
  openCollectionSettings,
}: ReactImageAnnotateWrapperProps) => {
  const annotationEditPopupRef = useRef<HTMLDivElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>();
  const regions: any[] = useMemo(() => {
    const currentCollectionAsRegions = currentKeypointCollection
      ? convertCollectionToRegions(currentKeypointCollection)
      : [];

    return [...convertAnnotations(annotations), ...currentCollectionAsRegions];
  }, [annotations, currentKeypointCollection]);

  const dispatch: AppDispatch = useDispatch();

  const collectionOptions = predefinedLabels?.predefinedKeypoints.map(
    (keyPointCollection) => ({
      value: keyPointCollection.collectionName,
      label: keyPointCollection.collectionName,
    })
  );
  const shapeOptions = predefinedLabels?.predefinedShapes.map((shape) => ({
    value: shape.shapeName,
    label: shape.shapeName,
    color: shape.color,
  }));

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

  useEffect(() => {
    return () => {
      dispatch(deleteCurrentCollection());
    };
  }, []);

  useEffect(() => {
    dispatch(deleteCurrentCollection());
    dispatch(deselectAllSelectionsReviewPage());
  }, [fileInfo, selectedTool]);

  const handleCreateRegion = async (region: Region) => {
    const annotationCollectionLabel =
      region.tags && region.tags[RegionTagsIndex.label];
    const keyPointOrder =
      region.tags && region.tags[RegionTagsIndex.keypointOrder];
    if (annotationCollectionLabel) {
      if (region.type === 'point') {
        await dispatch(
          onCreateKeyPoint(
            region.id,
            annotationCollectionLabel,
            region.x,
            region.y,
            keyPointOrder
          )
        );
        const thunkResponse = await dispatch(CreateKeypointAnnotation());
        const keypointCollection = unwrapResult(thunkResponse);
        if (keypointCollection) {
          onCreateAnnotation(
            convertKeyPointCollectionToAnnotationStub(keypointCollection)
          );
        }
      } else {
        await dispatch(onCreateOrUpdateShape(annotationCollectionLabel));
        onCreateAnnotation(convertToAnnotation(region));
      }
    }
  };

  const handleUpdateRegion = async (region: Region) => {
    const annotationLabel = region.tags && region.tags[RegionTagsIndex.label];

    if (annotationLabel) {
      if (region.type === 'point') {
        await dispatch(onUpdateKeyPoint(region));
        // check for availability of CDF annotation id
        if (region.tags && region.tags[RegionTagsIndex.parentAnnotationId]) {
          const thunkResponse = await dispatch(
            RetrieveKeypointCollection(
              region.tags[RegionTagsIndex.parentAnnotationId]
            )
          );
          const keypointCollection = unwrapResult(thunkResponse);
          if (keypointCollection) {
            onUpdateAnnotation(
              convertKeyPointCollectionToAnnotationStub(keypointCollection)
            );
          }
        }
      } else {
        await dispatch(onCreateOrUpdateShape(annotationLabel));
        onUpdateAnnotation(convertToAnnotation(region));
      }
    }
  };
  const handleDeleteRegion = (region: Region) => {
    onDeleteAnnotation(convertToAnnotation(region));
  };

  const NewRegionEditLabel = useMemo(() => {
    return ({
      region,
      editing,
      onDelete,
      onClose,
      onChange,
    }: {
      region: Region;
      editing: boolean;
      onDelete: (region: Region) => void;
      onClose: (region: Region) => void;
      onChange: (region: Region) => void;
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
          lastShape={lastShapeName!}
          lastCollection={lastKeypointCollection}
          onOpenCollectionSettings={openCollectionSettings}
          popupReference={annotationEditPopupRef}
          nextKeypoint={nextToDoKeypointInCurrentCollection}
        />
      );
      /* eslint-enable react/prop-types */
    };
  }, [
    onCreateAnnotation,
    onUpdateAnnotation,
    predefinedLabels,
    nextToDoKeypointInCurrentCollection,
    lastShapeName,
  ]);

  const onRegionSelect = (region: Region) => {
    dispatch(deselectAllSelectionsReviewPage());
    let selectedAnnotationId: ReactText;
    // keypoint regions will have a string id
    if (typeof region.id === 'string') {
      dispatch(keypointSelectStatusChange(region.id));
      selectedAnnotationId = region.tags![RegionTagsIndex.parentAnnotationId];
    } else {
      dispatch(selectAnnotation(region.id));
      selectedAnnotationId = region.id;
    }
    if (selectedAnnotationId) {
      let annotation: AnnotationTableItem = annotations.find(
        (ann) => ann.id === +selectedAnnotationId
      ) as AnnotationTableItem;
      if (!annotation && currentKeypointCollection) {
        annotation = {
          ...convertKeyPointCollectionToAnnotationStub(
            currentKeypointCollection
          ),
        };
      }
      if (annotation) {
        focusIntoView(annotation);
      }
    }
  };

  const deselectAllRegions = () => {
    dispatch(deselectAllSelectionsReviewPage());
  };

  const onToolChange = (tool: AnnotatorTool) => {
    onSelectTool(tool);
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
