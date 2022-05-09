import { FileInfo } from '@cognite/sdk';
import { Modal } from 'antd';
import React, {
  CSSProperties,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { useDispatch } from 'react-redux';
import { hotKeyMap } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/HotKeyMap';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import {
  extractAnnotationIdFromElement,
  getActiveRowSelection,
} from 'src/modules/Review/Containers/KeyboardShortKeys/ShortKeyUtils';
import { setSelectedTool } from 'src/modules/Review/store/annotationLabel/slice';
import { AppDispatch } from 'src/store';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';

export const ImageKeyboardShortKeys = ({
  children,
  contextElement,
  file,
}: {
  children: any;
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
      delete_annotation: deleteSelectedAnnotation,
    };
  }, []);

  return (
    <GlobalHotKeys keyMap={hotKeyMap} handlers={hotkeyHandlers}>
      {children}
    </GlobalHotKeys>
  );
};
