import { FileInfo } from '@cognite/sdk';
import { Modal } from 'antd';
import React, {
  CSSProperties,
  ReactText,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { batch, useDispatch } from 'react-redux';
import { hotKeyMap } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/HotKeyMap';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import {
  extractAnnotationIdFromElement,
  getActiveKeypointSelection,
  getActiveRowIndex,
  getActiveRowSelection,
  getAnnotationIdOrKeypointIdForRowSelect,
} from 'src/modules/Review/Containers/KeyboardShortKeys/ShortKeyUtils';
import {
  keypointSelectStatusChange,
  setSelectedTool,
} from 'src/modules/Review/store/annotationLabel/slice';
import { selectAnnotation } from 'src/modules/Review/store/reviewSlice';
import { AppDispatch } from 'src/store';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { AnnotationStatusChange } from 'src/store/thunks/Annotation/AnnotationStatusChange';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';

export const ImageKeyboardShortKeys = ({
  scrollToItem,
  children,
  contextElement,
  file,
}: {
  children: any;
  scrollToItem: (id: ReactText) => void;
  contextElement: RefObject<HTMLElement>;
  file: FileInfo;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const modalRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    return () => {
      if (modalRef.current) {
        modalRef.current?.destroy();
      }
    };
  }, [file]);

  const setSelectedAnnotationAsActive = (
    annotationId: string,
    isKeypoint?: boolean
  ) => {
    if (annotationId) {
      scrollToItem(annotationId);
      if (isKeypoint) {
        dispatch(keypointSelectStatusChange(annotationId));
      } else {
        batch(() => {
          dispatch(deselectAllSelectionsReviewPage());
          dispatch(selectAnnotation(+annotationId));
        });
      }
    }
  };

  const selectPrevRow = useCallback(() => {
    const [annotationOrKeypointId, isActiveKeypoint] =
      getAnnotationIdOrKeypointIdForRowSelect(
        contextElement.current,
        (rows, currentActiveRowIndex) => {
          if (rows.length) {
            if (currentActiveRowIndex !== undefined) {
              const prevIndex = currentActiveRowIndex - 1;
              if (prevIndex < 0) {
                return rows.length + prevIndex;
              }
              return prevIndex;
            }
            return 0;
          }
          return null;
        }
      );
    if (annotationOrKeypointId) {
      setSelectedAnnotationAsActive(annotationOrKeypointId, isActiveKeypoint);
    }
  }, []);

  const selectNextRow = useCallback(() => {
    const [annotationOrKeypointId, isActiveKeypoint] =
      getAnnotationIdOrKeypointIdForRowSelect(
        contextElement.current,
        (rows, currentActiveRowIndex) => {
          if (rows.length) {
            if (currentActiveRowIndex !== undefined) {
              const nextIndex = currentActiveRowIndex + 1;

              if (nextIndex < rows.length) {
                return nextIndex;
              }
              return nextIndex - rows.length;
            }
            return 0;
          }
          return null;
        }
      );

    if (annotationOrKeypointId) {
      setSelectedAnnotationAsActive(annotationOrKeypointId, isActiveKeypoint);
    }
  }, []);

  const moveIntoAnnotationCollection = useCallback(() => {
    if (contextElement.current) {
      let keypointAnnotationId;

      const activeKeypoint = getActiveKeypointSelection(contextElement.current);

      const currentActiveTableRow = getActiveRowSelection(
        contextElement.current
      );

      if (!activeKeypoint && currentActiveTableRow) {
        const childElements = currentActiveTableRow.getElementsByClassName(
          'annotation-table-expand-row'
        );

        if (childElements.length) {
          const currentActiveChildElementIndex =
            getActiveRowIndex(childElements);
          if (currentActiveChildElementIndex === undefined) {
            keypointAnnotationId = extractAnnotationIdFromElement(
              childElements[0]
            );
          } else {
            keypointAnnotationId = extractAnnotationIdFromElement(
              childElements[currentActiveChildElementIndex]
            );
          }
        }
      }

      if (keypointAnnotationId) {
        setSelectedAnnotationAsActive(keypointAnnotationId, true);
      }
    }
  }, []);

  const moveOutAnnotationCollection = useCallback(() => {
    if (contextElement.current) {
      let annotationId;

      const activeKeypoint = getActiveKeypointSelection(contextElement.current);

      if (activeKeypoint) {
        const parentRowElement = activeKeypoint.closest(
          '.annotation-table-row'
        );

        if (parentRowElement) {
          annotationId = extractAnnotationIdFromElement(
            parentRowElement as HTMLElement
          );
        }
      }

      if (annotationId) {
        setSelectedAnnotationAsActive(annotationId);
      }
    }
  }, []);

  const setStatusOnSelectedAnnotation = useCallback(async (status: boolean) => {
    if (contextElement.current) {
      let annotationId;
      const activeRow = getActiveRowSelection(contextElement.current);
      if (activeRow) {
        annotationId = extractAnnotationIdFromElement(activeRow);
      }
      if (annotationId) {
        dispatch(
          AnnotationStatusChange({
            id: +annotationId,
            status: status
              ? AnnotationStatus.Verified
              : AnnotationStatus.Rejected,
          })
        );
      }
    }
  }, []);

  const deleteSelectedAnnotation = useCallback(() => {
    if (contextElement.current) {
      let annotationId: string | number | null;
      const activeRow = getActiveRowSelection(contextElement.current);
      if (activeRow) {
        annotationId = extractAnnotationIdFromElement(activeRow);
      }

      // @ts-ignore
      if (annotationId) {
        modalRef.current = Modal.confirm({
          title: 'Confirm Delete',
          content: 'Are you sure you want delete this annotation?',
          autoFocusButton: 'ok',
          okText: 'Confirm',
          okButtonProps: {
            style: {
              backgroundColor: 'var(--cogs-red)',
              color: 'white',
              '&:focus': {
                borderColor: 'var(--cogs-red)',
              },
            } as CSSProperties,
          },
          keyboard: true,
          getContainer: '.confirm-delete-modal-anchor',
          maskClosable: true,
          onOk: () =>
            dispatch(
              DeleteAnnotationsAndHandleLinkedAssetsOfFile({
                annotationIds: [+annotationId!],
                showWarnings: true,
              })
            ),
          onCancel: () => {},
        });
      }
    }
  }, []);

  const hotkeyHandlers = useMemo(() => {
    return {
      select_tool: () => dispatch(setSelectedTool(tools.SELECT_TOOL)),
      pan_tool: () => dispatch(setSelectedTool(tools.PAN_TOOL)),
      create_point: () => dispatch(setSelectedTool(tools.KEYPOINT_TOOL)),
      create_bounding_box: () =>
        dispatch(setSelectedTool(tools.RECTANGLE_TOOL)),
      create_polygon: () => dispatch(setSelectedTool(tools.POLYGON_TOOL)),
      create_line: () => dispatch(setSelectedTool(tools.LINE_TOOL)),
      approve_annotation: () => setStatusOnSelectedAnnotation(true),
      reject_annotation: () => setStatusOnSelectedAnnotation(false),
      delete_annotation: deleteSelectedAnnotation,
    };
  }, [
    selectPrevRow,
    selectNextRow,
    moveIntoAnnotationCollection,
    moveOutAnnotationCollection,
  ]);

  return (
    <GlobalHotKeys keyMap={hotKeyMap} handlers={hotkeyHandlers}>
      {children}
    </GlobalHotKeys>
  );
};
