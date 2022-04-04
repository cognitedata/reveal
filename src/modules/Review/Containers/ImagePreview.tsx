import { FileInfo } from '@cognite/sdk';
import { Button, Tooltip } from '@cognite/cogs.js';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { ReactText, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UnsavedAnnotation, CDFAnnotationV1 } from 'src/api/annotation/types';
import { AnnotationSettingsModal } from 'src/modules/Review/Components/AnnotationSettingsModal/AnnotationSettingsModal';
import { KeyboardShortcutModal } from 'src/modules/Review/Components/KeyboardShortcutModal/KeyboardShortcutModal';
import { ReactImageAnnotateWrapper } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ReactImageAnnotateWrapper';
import {
  setKeepUnsavedRegion,
  setLastCollectionName,
  setLastShape,
  setSelectedTool,
} from 'src/modules/Review/store/annotationLabel/slice';
import {
  currentCollection,
  nextCollection,
  nextKeypoint,
  nextShape,
} from 'src/modules/Review/store/annotationLabel/selectors';
import {
  selectAnnotationSettingsState,
  selectVisibleNonRejectedAnnotationsForFile,
  showAnnotationSettingsModel,
} from 'src/modules/Review/store/reviewSlice';
import {
  AnnotationCollection,
  AnnotationTableItem,
  Tool,
} from 'src/modules/Review/types';
import { AppDispatch } from 'src/store';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { RootState } from 'src/store/rootReducer';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { pushMetric } from 'src/utils/pushMetric';
import styled from 'styled-components';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import isEmpty from 'lodash/isEmpty';

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
  const dispatch: AppDispatch = useDispatch();
  const [showKeyboardShortcutModal, setShowKeyboardShortcutModal] =
    useState(false);

  const visibleNonRejectedAnnotations = useSelector((rootState: RootState) =>
    selectVisibleNonRejectedAnnotationsForFile(rootState, file.id)
  );

  const definedCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      annotationLabelReducer.predefinedAnnotations
  );

  const nextShapeName = useSelector((rootState: RootState) =>
    nextShape(rootState)
  );

  const nextKeypointCollection = useSelector((rootState: RootState) =>
    nextCollection(rootState)
  );

  const nextKeypointInCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      nextKeypoint(annotationLabelReducer)
  );

  const currentTool = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      annotationLabelReducer.currentTool
  );

  const currentKeypointCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      currentCollection(annotationLabelReducer)
  );

  const annotationSettingsState = useSelector(({ reviewSlice }: RootState) =>
    selectAnnotationSettingsState(reviewSlice)
  );

  useEffect(() => {
    if (currentKeypointCollection) {
      scrollIntoView(currentKeypointCollection.id);
    }
  }, [currentKeypointCollection]);

  const handleCreateAnnotation = async (annotation: UnsavedAnnotation) => {
    pushMetric('Vision.Review.CreateAnnotation');

    if (annotation?.region?.shape === 'rectangle') {
      pushMetric('Vision.Review.CreateAnnotation.Rectangle');
    }
    if (annotation?.region?.shape === 'points') {
      pushMetric('Vision.Review.CreateAnnotation.Points');
    }
    if (annotation?.region?.shape === 'polygon') {
      pushMetric('Vision.Review.CreateAnnotation.Polygon');
    }
    if (annotation?.region?.shape === 'polyline') {
      pushMetric('Vision.Review.CreateAnnotation.Line');
    }
    const res = await dispatch(
      CreateAnnotations({ fileId: file.id, annotation })
    );
    const createdAnnotations = unwrapResult(res);

    if (createdAnnotations.length && createdAnnotations[0].id) {
      scrollIntoView(createdAnnotations[0].id);
    }
  };

  const handleModifyAnnotation = async (annotation: CDFAnnotationV1) => {
    dispatch(deselectAllSelectionsReviewPage());
    await dispatch(UpdateAnnotations([annotation]));
  };

  const handleDeleteAnnotation = (annotation: CDFAnnotationV1) => {
    dispatch(
      DeleteAnnotationsAndHandleLinkedAssetsOfFile({
        annotationIds: [annotation.id],
        showWarnings: true,
      })
    );
  };

  const handleInEditMode = (mode: boolean) => {
    onEditMode(mode);
  };

  const onFocus = (annotation: AnnotationTableItem) => {
    scrollIntoView(annotation.id);
  };

  const onSelectTool = (tool: Tool) => {
    dispatch(setSelectedTool(tool));
  };

  const onOpenAnnotationSettings = (
    type = 'shape',
    text?: string,
    color?: string
  ) => {
    dispatch(setKeepUnsavedRegion(true));
    dispatch(showAnnotationSettingsModel(true, type, text, color));
  };

  const onOpenKeyboardShortcuts = () => {
    setShowKeyboardShortcutModal(true);
  };

  const onDoneAnnotationSettings = async (
    newCollection: AnnotationCollection | null
  ) => {
    try {
      if (newCollection) {
        if (
          newCollection.predefinedShapes.length ||
          newCollection.predefinedKeypoints.length
        ) {
          await dispatch(SaveAnnotationTemplates(newCollection)).unwrap();
          if (!isEmpty(annotationSettingsState.createNew)) {
            if (
              annotationSettingsState.activeView === 'shape' &&
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
              annotationSettingsState.activeView === 'keypoint' &&
              newCollection.predefinedKeypoints.length > 0
            ) {
              dispatch(
                setLastCollectionName(
                  newCollection.predefinedKeypoints[
                    newCollection.predefinedKeypoints.length - 1
                  ].collectionName
                )
              );
            }
          }
        }
        dispatch(showAnnotationSettingsModel(false));
        dispatch(setKeepUnsavedRegion(false));
      }
    } catch (e) {
      console.error('Error occurred while saving predefined annotations!');
    }
  };

  return (
    <Container>
      <ReactImageAnnotateWrapper
        fileInfo={file}
        annotations={visibleNonRejectedAnnotations}
        onCreateAnnotation={handleCreateAnnotation}
        onUpdateAnnotation={handleModifyAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
        handleInEditMode={handleInEditMode}
        predefinedAnnotations={definedCollection}
        lastShapeName={nextShapeName}
        lastKeypointCollection={nextKeypointCollection}
        nextToDoKeypointInCurrentCollection={nextKeypointInCollection}
        currentKeypointCollection={currentKeypointCollection}
        isLoading={isLoading}
        selectedTool={currentTool}
        onSelectTool={onSelectTool}
        focusIntoView={onFocus}
        openAnnotationSettings={onOpenAnnotationSettings}
      />
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
            toggled={annotationSettingsState.show}
          />
        </Tooltip>
      </ExtraToolbar>
      <AnnotationSettingsModal
        predefinedAnnotations={definedCollection}
        showModal={annotationSettingsState.show}
        onCancel={() => {
          dispatch(showAnnotationSettingsModel(false));
          dispatch(setKeepUnsavedRegion(false));
        }}
        onDone={onDoneAnnotationSettings}
        options={annotationSettingsState}
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
