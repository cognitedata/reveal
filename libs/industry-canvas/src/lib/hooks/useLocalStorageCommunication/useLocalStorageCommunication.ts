import { useEffect } from 'react';

import { partition } from 'lodash';

import { UnifiedViewer } from '@cognite/unified-file-viewer';

import { ContainerReference, SerializedCanvasDocument } from '../../types';

import parseJsonToArray from './parseJsonToArray';
import { OpenedCanvas, PendingContainerReference } from './types';

// Key that contains list of currently opened tabs. Once the tab is closed or the user leaves
// the canvas, it's removed from this key as well.
const IC_OPENED_CANVASES = 'INDUSTRIAL_CANVAS_OPENED_CANVASES';

// Key that temporarily holds container references that should be added to a specific canvas
// Once consumed they are removed from here.
const IC_PENDING_CONTAINER_REFERENCE =
  'INDUSTRIAL_CANVAS_PENDING_CONTAINER_REFERENCE';

export const addPendingContainerReference = ({
  canvasExternalId,
  containerReference,
}: PendingContainerReference) => {
  const pendingContainerReferences = readPendingContainerReferences();

  writePendingContainerReferences([
    ...pendingContainerReferences,
    {
      canvasExternalId,
      containerReference,
    },
  ]);
};

export const readPendingContainerReferences = (): PendingContainerReference[] =>
  parseJsonToArray(localStorage.getItem(IC_PENDING_CONTAINER_REFERENCE));

export const readOpenedCanvases = (): OpenedCanvas[] =>
  parseJsonToArray(localStorage.getItem(IC_OPENED_CANVASES));

export const writePendingContainerReferences = (
  pendingContainerReferences: PendingContainerReference[]
) => {
  localStorage.setItem(
    IC_PENDING_CONTAINER_REFERENCE,
    JSON.stringify(pendingContainerReferences)
  );
};

const writeOpenedCanvases = (openedCanvases: OpenedCanvas[]) => {
  localStorage.setItem(IC_OPENED_CANVASES, JSON.stringify(openedCanvases));
};

const useLocalStorageCommunication = (
  unifiedViewerRef: UnifiedViewer | null,
  canvas: SerializedCanvasDocument | undefined,
  onAddContainerReferences: (containerReferences: ContainerReference[]) => void
) => {
  useEffect(() => {
    if (unifiedViewerRef === null) {
      return;
    }

    if (canvas === undefined) {
      return;
    }

    const openedCanvases: OpenedCanvas[] = readOpenedCanvases();
    writeOpenedCanvases([
      ...openedCanvases.filter(
        ({ externalId }) => externalId !== canvas.externalId
      ),
      {
        externalId: canvas.externalId,
        name: canvas.name,
      },
    ]);

    const removeCanvasFromListOfOpenedCanvases = () => {
      writeOpenedCanvases(
        readOpenedCanvases().filter(
          ({ externalId }) => externalId !== canvas.externalId
        )
      );
    };

    window.addEventListener(
      'beforeunload',
      removeCanvasFromListOfOpenedCanvases
    );

    return () => {
      window.removeEventListener(
        'beforeunload',
        removeCanvasFromListOfOpenedCanvases
      );
      removeCanvasFromListOfOpenedCanvases();
    };
  }, [unifiedViewerRef, canvas]);

  useEffect(() => {
    if (unifiedViewerRef === null) {
      return;
    }

    if (canvas === undefined) {
      return;
    }

    const onStorageEvent = () => {
      const pendingContainerReferences = readPendingContainerReferences();
      const [matches, otherPendingContainerReferences] = partition(
        pendingContainerReferences,
        ({ canvasExternalId }) => canvasExternalId === canvas.externalId
      );

      writePendingContainerReferences(otherPendingContainerReferences);

      if (matches.length > 0) {
        onAddContainerReferences(
          matches.map(({ containerReference }) => containerReference)
        );
      }
    };

    window.addEventListener('storage', onStorageEvent);

    return () => {
      window.removeEventListener('storage', onStorageEvent);
    };
  }, [unifiedViewerRef, canvas, onAddContainerReferences]);
};

export default useLocalStorageCommunication;
