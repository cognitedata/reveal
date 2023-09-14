import { useCallback, useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import CanvasSearch from '@data-exploration-components/containers/Files/Canvas/CanvasSearch';
import { getCanvasConnectionAnnotations } from '@data-exploration-components/containers/Files/Canvas/getCanvasConnectionAnnotations';
import { isNotUndefinedTuple } from '@data-exploration-components/containers/Files/Canvas/isNotUndefinedTuple';
import {
  PagedFileReference,
  useCanvasFilesFromUrl,
} from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import useCanvasTooltips from '@data-exploration-components/containers/Files/Canvas/useCanvasTooltips';
import { useFileInfos } from '@data-exploration-components/containers/Files/Canvas/useFileInfos';
import { getPagedContainerId } from '@data-exploration-components/containers/Files/Canvas/utils';
import zip from 'lodash/zip';

import { toast, Flex } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import ReactUnifiedViewer, {
  Annotation,
  ContainerConfig,
  getContainerConfigFromFileInfo,
  getContainersInRowLayout,
  isSupportedFileInfo,
  UnifiedViewer,
  UnifiedViewerMouseEvent,
} from '@cognite/unified-file-viewer';

import { EMPTY_ARRAY, ExtendedAnnotation } from '@data-exploration-lib/core';

import {
  MAX_CONTAINER_HEIGHT,
  MAX_CONTAINER_WIDTH,
} from '../FilePreview/constants';

import { useCanvasAnnotations } from './hooks';

export type MultiFileViewerProps = {
  id: string;
  applicationId: string;
  showControls?: boolean;
  files: PagedFileReference[];
  onRef?: (ref: UnifiedViewer | null) => void;
};

const CONTAINER_MARGIN = 100;

// Since we always load two documents side-by-side, we multiply by 2 and add some extra because of the spacing between the documents.
const expectedViewportWidth = 2.1 * MAX_CONTAINER_WIDTH;
const INITIAL_VIEWPORT_CENTER = {
  x: 0.48 * expectedViewportWidth,
  y: 0.5 * MAX_CONTAINER_HEIGHT,
};
const INITIAL_VIEWPORT_SIZE = {
  width: expectedViewportWidth,
  height: MAX_CONTAINER_HEIGHT,
};

export const Canvas = ({
  id,
  applicationId,
  files = EMPTY_ARRAY,
  onRef,
}: MultiFileViewerProps) => {
  const [containers, setContainers] = useState<ContainerConfig[]>([]);
  const { addFile } = useCanvasFilesFromUrl();

  const [
    { hoverId, clickedContainer, selectedAnnotation },
    setInteractionState,
  ] = useState<{
    hoverId: string | undefined;
    clickedContainer: PagedFileReference | undefined;
    selectedAnnotation: ExtendedAnnotation | undefined;
  }>({
    hoverId: undefined,
    clickedContainer: undefined,
    selectedAnnotation: undefined,
  });

  const sdk = useSDK();

  const { data: fileInfos } = useFileInfos(files.map((f) => f.id));
  useEffect(
    () =>
      setInteractionState({
        hoverId: undefined,
        clickedContainer: undefined,
        selectedAnnotation: undefined,
      }),
    [files]
  );

  useEffect(() => {
    (async () => {
      if (fileInfos) {
        const loadedFileContainers = await Promise.all(
          zip(files, fileInfos)
            .filter(isNotUndefinedTuple)
            .map(([pagedFileReference, fileInfo]) => {
              return getContainerConfigFromFileInfo(sdk as any, fileInfo, {
                id: getPagedContainerId(
                  pagedFileReference.id,
                  pagedFileReference.page
                ),
                label: fileInfo.name ?? fileInfo.externalId,
                page: pagedFileReference.page,
                maxWidth: MAX_CONTAINER_WIDTH,
                maxHeight: MAX_CONTAINER_HEIGHT,
                fontSize: 72,
                onClick: (e: UnifiedViewerMouseEvent) => {
                  e.cancelBubble = true;
                  setInteractionState({
                    hoverId: undefined,
                    clickedContainer: pagedFileReference,
                    selectedAnnotation: undefined,
                  });
                },
              });
            })
        );
        setContainers(
          getContainersInRowLayout(loadedFileContainers, {
            margin: CONTAINER_MARGIN,
          })
        );
      }
    })();
  }, [fileInfos, sdk, files]);

  const onClickAnnotation = useCallback(
    (annotation: ExtendedAnnotation) =>
      setInteractionState((prevInteractionState) => ({
        clickedContainer: undefined,
        hoverId: undefined,
        selectedAnnotation:
          prevInteractionState.selectedAnnotation === annotation
            ? undefined
            : annotation,
      })),
    []
  );

  const onAnnotationMouseOver = useCallback((annotation: Annotation) => {
    setInteractionState((prevInteractionState) => ({
      ...prevInteractionState,
      hoverId: annotation.id,
    }));
  }, []);

  const onAnnotationMouseOut = useCallback(() => {
    setInteractionState((prevInteractionState) => ({
      ...prevInteractionState,
      hoverId: undefined,
    }));
  }, []);

  const annotations = useCanvasAnnotations({
    files,
    selectedAnnotation,
    hoverId,
    onClick: onClickAnnotation,
    onMouseOver: onAnnotationMouseOver,
    onMouseOut: onAnnotationMouseOut,
  });

  const onAddFile = useCallback(
    (pagedFileReference: PagedFileReference) => {
      addFile(pagedFileReference);
      toast.success(
        <div>
          <h4>Document added to your canvas</h4>
        </div>,
        {
          toastId: `canvas-file-added-${pagedFileReference.id}`,
          position: 'top-right',
        }
      );
    },
    [addFile]
  );

  const tooltips = useCanvasTooltips({
    annotations: annotations,
    selectedAnnotation,
    clickedContainer,
    onAddFile,
  });

  const onStageClick = useCallback(() => {
    setInteractionState({
      selectedAnnotation: undefined,
      clickedContainer: undefined,
      hoverId: undefined,
    });
  }, [setInteractionState]);

  const enhancedAnnotations: Annotation[] = useMemo(
    () => [
      // TODO: Bug tracked by https://cognitedata.atlassian.net/browse/UFV-363
      // ...getClickedContainerOutlineAnnotation(clickedContainer),
      ...getCanvasConnectionAnnotations({
        pagedFileReferences: files,
        hoverId,
        annotations,
      }),
      ...annotations,
    ],
    [files, annotations, hoverId]
  );

  // TODO: How to handle unsupported files
  // Story: User is looking at a file and then tries to add another file which is of an unsupported type
  if (fileInfos?.some((file) => !isSupportedFileInfo(file))) {
    return (
      <StyledFlex
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <h1>No preview for this type of file</h1>
      </StyledFlex>
    );
  }

  return (
    <FullHeightWrapper>
      <FullHeightWrapper>
        <ReactUnifiedViewer
          applicationId={applicationId}
          id={id}
          containers={containers}
          annotations={enhancedAnnotations}
          tooltips={tooltips}
          onClick={onStageClick}
          shouldShowZoomControls
          initialViewport={{
            ...INITIAL_VIEWPORT_CENTER,
            ...INITIAL_VIEWPORT_SIZE,
          }}
          setRef={onRef}
        />
        <CanvasSearch onItemClick={onAddFile} />
      </FullHeightWrapper>
    </FullHeightWrapper>
  );
};

const StyledFlex = styled(Flex)`
  height: 100%;
`;

const FullHeightWrapper = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  position: relative;
`;
