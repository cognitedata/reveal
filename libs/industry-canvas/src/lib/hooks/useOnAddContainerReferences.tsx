import { useCallback } from 'react';

import { v4 as uuid } from 'uuid';

import { toast } from '@cognite/cogs.js';
import { isNotUndefined } from '@cognite/data-exploration';
import { useSDK } from '@cognite/sdk-provider';
import { UnifiedViewer } from '@cognite/unified-file-viewer';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { translationKeys } from '../common/i18n/translationKeys';
import {
  SHAMEFUL_WAIT_TO_ENSURE_CONTAINERS_ARE_RENDERED_MS,
  TOAST_POSITION,
} from '../constants';
import { addContainerReferences } from '../state/useIndustrialCanvasStore';
import { ContainerReference, IndustryCanvasContainerConfig } from '../types';
import enforceTimeseriesApplyToAllIfEnabled from '../utils/enforceTimeseriesApplyToAllIfEnabled';
import { zoomToFitAroundContainerIds } from '../utils/zoomToFitAroundContainerIds';

import { TooltipsOptions } from './useTooltipsOptions';
import { useTranslation } from './useTranslation';

// Note: Temporary hook to facilitate refactoring
const useOnAddContainerReferences = ({
  unifiedViewerRef,
  selectedContainers,
  clickedContainerAnnotation,
  containers,
  isCanvasLocked,
  tooltipsOptions,
}: {
  unifiedViewerRef: UnifiedViewer | null;
  selectedContainers: IndustryCanvasContainerConfig[];
  clickedContainerAnnotation: ExtendedAnnotation | undefined;
  containers: IndustryCanvasContainerConfig[] | undefined;
  isCanvasLocked: boolean;
  tooltipsOptions: TooltipsOptions;
}) => {
  const sdk = useSDK();
  const { t } = useTranslation();

  return useCallback(
    (containerReferences: ContainerReference[]) => {
      if (unifiedViewerRef === null) {
        return;
      }

      if (isCanvasLocked) {
        return;
      }

      // Ensure that we don't add a container with an ID that already exists
      const currentContainerIds = new Set((containers ?? []).map((c) => c.id));
      const containerReferencesToAdd = containerReferences.filter(
        (containerReference) =>
          containerReference.id === undefined ||
          !currentContainerIds.has(containerReference.id)
      );

      if (containerReferencesToAdd.length !== containerReferences.length) {
        toast.error(
          <div>
            <h4>
              {t(
                translationKeys.CANVAS_ADD_RESOURCE_ERROR_TITLE,
                'Could not add resource(s) to your canvas'
              )}
            </h4>
            <p>
              {t(
                translationKeys.CANVAS_ADD_RESOURCE_ERROR_MESSAGE,
                'At least one resource needs to be selected.'
              )}
            </p>
          </div>,
          {
            toastId: `canvas-file-already-added-${uuid()}`,
            position: TOAST_POSITION,
          }
        );
      }

      if (containerReferencesToAdd.length === 0) {
        return;
      }

      addContainerReferences({
        sdk,
        unifiedViewer: unifiedViewerRef,
        containerReferences: enforceTimeseriesApplyToAllIfEnabled(
          tooltipsOptions,
          containerReferencesToAdd
        ),
      }).then((newContainers) => {
        // When we add new containers, we want to zoom to fit and select them.
        // Since the new containers might not be rendered immediately, we need to wait a bit before we can do that.
        setTimeout(() => {
          zoomToFitAroundContainerIds({
            unifiedViewer: unifiedViewerRef,
            containerIds: [
              ...selectedContainers.map(
                (containerConfig) => containerConfig.id
              ),
              clickedContainerAnnotation?.containerId,
              ...newContainers.map((c) => c.id),
            ].filter(isNotUndefined),
          });

          unifiedViewerRef.selectByIds({
            containerIds: newContainers.map((c) => c.id),
            annotationIds: [],
          });
        }, SHAMEFUL_WAIT_TO_ENSURE_CONTAINERS_ARE_RENDERED_MS);
      });

      toast.success(
        <div>
          <h4>
            {t(
              translationKeys.CANVAS_RESOURCES_ADDED,
              'Resource(s) added to your canvas'
            )}
          </h4>
        </div>,
        {
          toastId: `canvas-file-added-${uuid()}`,
          position: TOAST_POSITION,
        }
      );
    },
    [
      sdk,
      addContainerReferences,
      unifiedViewerRef,
      selectedContainers,
      clickedContainerAnnotation,
      containers,
      isCanvasLocked,
      t,
      tooltipsOptions,
    ]
  );
};

export default useOnAddContainerReferences;
