import React, { ReactText, useEffect, useMemo, useState } from 'react';
import {
  deleteCurrentCollection,
  keypointSelectStatusChange,
  onCreateKeyPoint,
  onCreateOrUpdateShape,
  onUpdateKeyPoint,
} from 'src/modules/Review/store/annotationLabelSlice';
import {
  selectAnnotation,
  showCollectionSettingsModel,
} from 'src/modules/Review/store/reviewSlice';
import {
  AnnotationTableItem,
  ReactImageAnnotateWrapperProps,
  VisionOptionType,
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

export const ReactImageAnnotateWrapper: React.FC<ReactImageAnnotateWrapperProps> =
  ({
    onUpdateAnnotation,
    onCreateAnnotation,
    onDeleteAnnotation,
    annotations,
    fileInfo,
    collection,
    nextKeyPoint,
    currentShape,
    currentCollection,
    isLoading,
    onSelectTool,
    focusIntoView,
  }: ReactImageAnnotateWrapperProps) => {
    const [imageUrl, setImageUrl] = useState<string>();
    const [selectedTool, setSelectedTool] = useState<AnnotatorTool>();
    const regions: any[] = useMemo(() => {
      const currentCollectionAsRegions = currentCollection
        ? convertCollectionToRegions(currentCollection)
        : [];

      return [
        ...convertAnnotations(annotations),
        ...currentCollectionAsRegions,
      ];
    }, [annotations, currentCollection]);

    const dispatch: AppDispatch = useDispatch();

    const collectionOptions = collection?.predefinedKeypoints.map(
      (keyPointCollection) => ({
        value: keyPointCollection.collectionName,
        label: keyPointCollection.collectionName,
      })
    );
    const shapeOptions = collection?.predefinedShapes.map((shape) => ({
      value: shape.shapeName,
      label: shape.shapeName,
      color: shape.color,
    }));
    const keyPointOptionArray = collection?.predefinedKeypoints.map(
      (keyPointCollection) => ({
        key: keyPointCollection.collectionName,
        value:
          keyPointCollection?.keypoints?.map((keyPoint) => ({
            value: keyPoint.order,
            label: keyPoint.caption,
            color: keyPoint.color,
          })) || [],
      })
    );

    // const keypointDefinitions = collection?.predefinedKeyPoints.reduce(
    //   (acc, keypointDef) => ({
    //     ...acc,
    //     [keypointDef.collectionName]: {
    //       landmarks:
    //         keypointDef.keyPoints?.reduce(
    //           (keypointAcc, keypoint) => ({
    //             ...keypointAcc,
    //             [keypoint.order]: {
    //               label: keypoint.caption,
    //               color: keypoint.color,
    //               defaultPosition: keypoint.defaultPosition || [],
    //             },
    //           }),
    //           {}
    //         ) || {},
    //     },
    //   }),
    //   {}
    // );

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

    const handleCreateRegion = async (
      region: Region,
      labelValue: VisionOptionType<string>,
      keyPointValue: VisionOptionType<string>
    ) => {
      if (labelValue.value) {
        if (region.type === 'point') {
          if (keyPointValue.value) {
            await dispatch(
              onCreateKeyPoint(region, labelValue.value, keyPointValue.value)
            );
            const thunkResponse = await dispatch(CreateKeypointAnnotation());
            const keypointCollection = unwrapResult(thunkResponse);
            if (keypointCollection) {
              onCreateAnnotation(
                convertKeyPointCollectionToAnnotationStub(keypointCollection)
              );
            }
          }
        } else {
          await dispatch(onCreateOrUpdateShape(labelValue.value!));
          onCreateAnnotation(convertToAnnotation(region, labelValue));
        }
      }
    };

    const handleUpdateRegion = async (
      region: Region,
      labelValue: VisionOptionType<string>
    ) => {
      if (labelValue.value) {
        if (region.type === 'point') {
          await dispatch(onUpdateKeyPoint(region));
          if (region.tags && region.tags.length >= 3) {
            const thunkResponse = await dispatch(
              RetrieveKeypointCollection(region.tags[2])
            );
            const keypointCollection = unwrapResult(thunkResponse);
            if (keypointCollection) {
              onUpdateAnnotation(
                convertKeyPointCollectionToAnnotationStub(keypointCollection)
              );
            }
          }
        } else {
          await dispatch(onCreateOrUpdateShape(labelValue.value));
          onUpdateAnnotation(convertToAnnotation(region, labelValue));
        }
      }
    };
    const handleDeleteRegion = (region: Region) => {
      onDeleteAnnotation(convertToAnnotation(region));
    };

    const onOpenCollectionSettings = () => {
      dispatch(showCollectionSettingsModel(true));
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
            keyPointLabelOptionMap={keyPointOptionArray}
            nextPoint={nextKeyPoint!.orderNumber.toString() || '1'}
            nextShape={currentShape!}
            nextCollection={nextKeyPoint!.collectionName}
            onOpenCollectionSettings={onOpenCollectionSettings}
          />
        );
      };
    }, [
      onCreateAnnotation,
      onUpdateAnnotation,
      collection,
      nextKeyPoint,
      currentShape,
    ]);

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

    const onRegionSelect = (region: Region) => {
      dispatch(deselectAllSelectionsReviewPage());
      let selectedAnnotationId: ReactText;
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
        if (!annotation && currentCollection) {
          annotation = {
            ...convertKeyPointCollectionToAnnotationStub(currentCollection),
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
      setSelectedTool(tool);
    };

    const onImageOrVideoLoaded = () => {
      isLoading(false);
    };

    useEffect(() => {
      return () => {
        dispatch(deleteCurrentCollection());
      };
    }, []);

    return (
      <Container>
        <Annotator
          onExit={() => {}}
          hideHeader
          images={images}
          keypointDefinitions={{}}
          enabledTools={['create-box', 'create-polygon', 'create-point']}
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
