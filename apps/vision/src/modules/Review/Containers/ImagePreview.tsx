import React, { ReactText, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { unwrapResult } from '@reduxjs/toolkit';
import isEmpty from 'lodash/isEmpty';

import { Button, Tooltip } from '@cognite/cogs.js';
import { AnnotationChangeById, FileInfo, InternalId } from '@cognite/sdk';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { SaveAnnotations } from '../../../store/thunks/Annotation/SaveAnnotations';
import { SaveAnnotationTemplates } from '../../../store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotations } from '../../../store/thunks/Annotation/UpdateAnnotations';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from '../../../store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { pushMetric } from '../../../utils/pushMetric';
import {
  UnsavedVisionAnnotation,
  VisionAnnotationDataType,
} from '../../Common/types';
import {
  isImageKeypointCollectionData,
  isImageObjectDetectionBoundingBoxData,
  isImageObjectDetectionPolygonData,
  isImageObjectDetectionPolylineData,
} from '../../Common/types/typeGuards';
import { AnnotationSettingsModal } from '../Components/AnnotationSettingsModal/AnnotationSettingsModal';
import { KeyboardShortcutModal } from '../Components/KeyboardShortcutModal/KeyboardShortcutModal';
import { ReactImageAnnotateWrapper } from '../Components/ReactImageAnnotateWrapper/ReactImageAnnotateWrapper';
import {
  selectNextPredefinedKeypointCollection,
  selectNextPredefinedShape,
  selectTempKeypointCollection,
  selectTemporaryRegion,
} from '../store/annotatorWrapper/selectors';
import {
  clearTemporaryRegion,
  setLastCollectionName,
  setLastShape,
} from '../store/annotatorWrapper/slice';
import { AnnotationSettingsOption } from '../store/review/enums';
import {
  selectAnnotationSettingsState,
  selectNonRejectedVisionReviewAnnotationsForFile,
} from '../store/review/selectors';
import { showAnnotationSettingsModel } from '../store/review/slice';
import { PredefinedVisionAnnotations } from '../types';

import { ImageKeyboardShortKeys } from './KeyboardShortKeys/ImageKeyboardShortKeys';

export const ImagePreview = ({
  file,
  onEditMode,
  isLoading,
  scrollIntoView,
}: {
  file: FileInfo;
  onEditMode: (editMode: boolean) => void;
  isLoading: (status: boolean) => void;
  scrollIntoView: (id: ReactText) => void;
}) => {
  const dispatch = useThunkDispatch();
  const [showKeyboardShortcutModal, setShowKeyboardShortcutModal] =
    useState(false);

  const nonRejectedVisionReviewAnnotations = useSelector(
    (rootState: RootState) =>
      selectNonRejectedVisionReviewAnnotationsForFile(rootState, file.id)
  );

  const predefinedAnnotations = useSelector(
    ({ annotatorWrapperReducer }: RootState) =>
      annotatorWrapperReducer.predefinedAnnotations
  );

  const annotationSettings = useSelector(({ reviewSlice }: RootState) =>
    selectAnnotationSettingsState(reviewSlice)
  );

  const nextPredefinedKeypointCollection = useSelector((rootState: RootState) =>
    selectNextPredefinedKeypointCollection(rootState)
  );

  const tempKeypointCollection = useSelector(
    ({ annotatorWrapperReducer, annotationReducer }: RootState) =>
      selectTempKeypointCollection(annotatorWrapperReducer, {
        currentFileId: file.id,
        annotationColorMap: annotationReducer.annotationColorMap,
      })
  );

  const temporaryUnsavedRegion = useSelector(
    ({ annotatorWrapperReducer }: RootState) =>
      selectTemporaryRegion(annotatorWrapperReducer)
  );

  const nextPredefinedShape = useSelector((rootState: RootState) =>
    selectNextPredefinedShape(rootState)
  );

  const selectedTool = useSelector(
    ({ annotatorWrapperReducer }: RootState) =>
      annotatorWrapperReducer.currentTool
  );

  const scrollId = useSelector(
    (rootState: RootState) => rootState.reviewSlice.scrollToId
  );

  const handleCreateAnnotation = useCallback(
    async (
      annotation: Omit<
        UnsavedVisionAnnotation<VisionAnnotationDataType>,
        'annotatedResourceId'
      >
    ) => {
      pushMetric('Vision.Review.CreateAnnotation');

      if (isImageObjectDetectionBoundingBoxData(annotation.data)) {
        pushMetric('Vision.Review.CreateAnnotation.Rectangle');
      }
      if (isImageKeypointCollectionData(annotation.data)) {
        pushMetric('Vision.Review.CreateAnnotation.Points');
      }
      if (isImageObjectDetectionPolygonData(annotation.data)) {
        pushMetric('Vision.Review.CreateAnnotation.Polygon');
      }
      if (isImageObjectDetectionPolylineData(annotation.data)) {
        pushMetric('Vision.Review.CreateAnnotation.Line');
      }
      const res = await dispatch(
        SaveAnnotations([{ ...annotation, annotatedResourceId: file.id }])
      );
      const createdAnnotations = unwrapResult(res);

      dispatch(clearTemporaryRegion());

      if (createdAnnotations.length && createdAnnotations[0].id) {
        scrollIntoView(createdAnnotations[0].id);
      }
    },
    [file, scrollIntoView]
  );

  const handleModifyAnnotation = useCallback(
    async (annotationChanges: AnnotationChangeById) => {
      await dispatch(UpdateAnnotations([annotationChanges]));
    },
    [dispatch]
  );

  const handleDeleteAnnotation = useCallback(
    (annotationId: InternalId) => {
      dispatch(
        DeleteAnnotationsAndHandleLinkedAssetsOfFile({
          annotationId,
          showWarnings: true,
        })
      );
    },
    [dispatch]
  );

  const onOpenAnnotationSettings = useCallback(
    (
      type: string = AnnotationSettingsOption.SHAPE,
      text?: string,
      color?: string
    ) => {
      dispatch(showAnnotationSettingsModel(true, type, text, color));
    },
    [dispatch]
  );

  const onOpenKeyboardShortcuts = () => {
    setShowKeyboardShortcutModal(true);
  };

  const onDoneAnnotationSettings = useCallback(
    async (newCollection: PredefinedVisionAnnotations | null) => {
      try {
        if (newCollection) {
          if (
            newCollection.predefinedShapes.length ||
            newCollection.predefinedKeypointCollections.length
          ) {
            await dispatch(SaveAnnotationTemplates(newCollection)).unwrap();
            if (!isEmpty(annotationSettings.createNew)) {
              if (
                annotationSettings.activeView ===
                  AnnotationSettingsOption.SHAPE &&
                newCollection.predefinedShapes.length > 0
              ) {
                dispatch(
                  setLastShape(
                    newCollection.predefinedShapes[
                      newCollection.predefinedShapes.length - 1
                    ].shapeName
                  )
                );
              } else if (
                annotationSettings.activeView ===
                  AnnotationSettingsOption.KEYPOINT &&
                newCollection.predefinedKeypointCollections.length > 0
              ) {
                dispatch(
                  setLastCollectionName(
                    newCollection.predefinedKeypointCollections[
                      newCollection.predefinedKeypointCollections.length - 1
                    ].collectionName
                  )
                );
              }
            }
          }
          dispatch(showAnnotationSettingsModel(false));
        }
      } catch (e) {
        console.error('Error occurred while saving predefined annotations!');
      }
    },
    [annotationSettings]
  );

  return (
    <Container>
      <ImageKeyboardShortKeys>
        <ReactImageAnnotateWrapper
          fileInfo={file}
          annotations={nonRejectedVisionReviewAnnotations}
          onEditMode={onEditMode}
          predefinedAnnotations={predefinedAnnotations}
          nextPredefinedKeypointCollection={nextPredefinedKeypointCollection}
          tempKeypointCollection={tempKeypointCollection}
          tempRegion={temporaryUnsavedRegion}
          isLoading={isLoading}
          focusIntoView={scrollIntoView}
          nextPredefinedShape={nextPredefinedShape}
          selectedTool={selectedTool}
          scrollId={scrollId}
          onCreateAnnotation={handleCreateAnnotation}
          onUpdateAnnotation={handleModifyAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          openAnnotationSettings={onOpenAnnotationSettings}
        />
      </ImageKeyboardShortKeys>
      <ExtraToolbar>
        <Tooltip
          content={
            <span data-testid="text-content">
              Open keyboard shortcuts legend
            </span>
          }
        >
          <ExtraToolItem
            type="ghost"
            aria-label="keyboard shortcuts"
            onClick={onOpenKeyboardShortcuts}
            toggled={showKeyboardShortcutModal}
          >
            <KeyboardShortcutsIcon
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                className={`KeyboardShortsIcon ${
                  showKeyboardShortcutModal ? 'toggled' : ''
                }`}
              >
                <path
                  d="M2.92543 8.52667L2.77654 8.6933H3H5.43743V13V13.1H5.53743H10.4585H10.5585V13V8.6933H13H13.2236L13.0745 8.52664L8.07252 2.93334L7.99795 2.84995L7.92341 2.93337L2.92543 8.52667ZM5.33171 7.56938L7.99803 4.5813L10.6681 7.56938H9.47511H9.37511V7.66938V11.9761H6.62489V7.66938V7.56938H6.52489H5.33171Z"
                  fill="#333333"
                  stroke="#333333"
                  strokeWidth="0.2"
                />
                <path
                  d="M3 1.4H13V-1.4H3V1.4ZM14.6 3V13H17.4V3H14.6ZM13 14.6H3V17.4H13V14.6ZM1.4 13V3H-1.4V13H1.4ZM3 14.6C2.11634 14.6 1.4 13.8837 1.4 13H-1.4C-1.4 15.4301 0.569947 17.4 3 17.4V14.6ZM14.6 13C14.6 13.8837 13.8837 14.6 13 14.6V17.4C15.4301 17.4 17.4 15.4301 17.4 13H14.6ZM13 1.4C13.8837 1.4 14.6 2.11634 14.6 3H17.4C17.4 0.569947 15.4301 -1.4 13 -1.4V1.4ZM3 -1.4C0.569947 -1.4 -1.4 0.569947 -1.4 3H1.4C1.4 2.11634 2.11634 1.4 3 1.4V-1.4Z"
                  fill="#333333"
                />
              </g>
            </KeyboardShortcutsIcon>
          </ExtraToolItem>
        </Tooltip>
        <Tooltip
          content={<span data-testid="text-content">Annotation settings</span>}
        >
          <ExtraToolItem
            type="ghost"
            icon="Settings"
            aria-label="open annotation settings"
            onClick={() => onOpenAnnotationSettings()}
            toggled={annotationSettings.show}
          />
        </Tooltip>
      </ExtraToolbar>
      <AnnotationSettingsModal
        predefinedAnnotations={predefinedAnnotations}
        showModal={annotationSettings.show}
        onCancel={() => {
          dispatch(showAnnotationSettingsModel(false));
        }}
        onDone={onDoneAnnotationSettings}
        options={annotationSettings}
      />
      <KeyboardShortcutModal
        showModal={showKeyboardShortcutModal}
        onCancel={() => setShowKeyboardShortcutModal(false)}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const ExtraToolbar = styled.div`
  position: absolute;
  bottom: 10px;
  width: 50px;
  display: grid;
`;

const ExtraToolItem = styled(Button)`
  height: 50px;
  width: 50px;
  border-radius: 50px;
`;

const KeyboardShortcutsIcon = styled('svg')`
  & .KeyboardShortsIcon.toggled path {
    fill: #4a67fb;
  }
`;
