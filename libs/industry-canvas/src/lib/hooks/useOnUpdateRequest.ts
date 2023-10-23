import { useCallback } from 'react';

import { FileInfo } from '@cognite/sdk';
import { CogniteClient } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';
import {
  ContainerConfig,
  UnifiedViewer,
  UnifiedViewerEventListenerMap,
  UnifiedViewerEventType,
  UpdateRequestSource,
} from '@cognite/unified-file-viewer';

import { RuleType } from '../components/ContextualTooltips/AssetTooltip/types';
import containerConfigToContainerReference from '../containerConfigToContainerReference';
import {
  setFileUploadDataFromPastedImageContainer,
  shamefulOnUpdateRequest,
} from '../state/useIndustrialCanvasStore';
import { CanvasNode, isIndustryCanvasContainerConfig } from '../types';
import { isPastedImageContainer } from '../utils/dataUrlUtils';
import useMetrics from '../utils/tracking/useMetrics';

import resolveContainerConfig from './utils/resolveContainerConfig';

export type InteractionState = {
  hoverId: string | undefined;
  clickedContainerAnnotationId: string | undefined;
};

export type UpdateHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_UPDATE_REQUEST];

export type IsConditionalFormattingOpenByAnnotationIdByTimeseriesId = Record<
  string,
  Record<number, boolean>
>;

export type LiveSensorRulesByAnnotationIdByTimeseriesId = Record<
  string,
  Record<number, RuleType[]>
>;

const mergeIfMatchById = <T extends { id: string }, U extends { id: string }>(
  array: T[],
  element: U
): U => {
  const foundElement = array.find((arrElem) => arrElem.id === element.id);

  if (!foundElement) {
    return element;
  }

  return {
    ...element,
    ...foundElement,
  };
};

export const getNextUpdatedNodes = (
  prevNodes: CanvasNode[],
  updatedNodes: CanvasNode[]
): CanvasNode[] => {
  return [
    ...prevNodes.map((prevNode) => mergeIfMatchById(updatedNodes, prevNode)),
    ...updatedNodes.filter(
      (updatedNode) => !prevNodes.some((node) => node.id === updatedNode.id)
    ),
  ];
};

// The reason we reresolve container configs is that they might originate from
// another tab. For documents and images particularly that might lead to us
// trying to reuse urls that have expired and do not correspond to any
// cache entries in the local tab.
const reresolveContainerConfigsFromClipboard = (
  containerConfigs: ContainerConfig[],
  sdk: CogniteClient
): Promise<ContainerConfig[]> => {
  return Promise.all(
    containerConfigs
      .filter(isIndustryCanvasContainerConfig)
      .map((containerConfig) =>
        resolveContainerConfig(
          sdk,
          containerConfigToContainerReference(containerConfig)
        )
      )
  );
};

const preprocessContainerUpdates = async (
  {
    source,
    containers,
  }: {
    source?: UpdateRequestSource;
    containers: ContainerConfig[];
  },
  sdk: CogniteClient
): Promise<ContainerConfig[]> => {
  if (source === UpdateRequestSource.CLIPBOARD) {
    return reresolveContainerConfigsFromClipboard(containers, sdk);
  }
  return containers;
};

const useOnUpdateRequest = ({
  unifiedViewer,
}: {
  unifiedViewer: UnifiedViewer | null;
}): UpdateHandlerFn => {
  const trackUsage = useMetrics();
  const sdk = useSDK();

  return useCallback(
    async ({ source, containers, annotations }) => {
      if (source === UpdateRequestSource.CLIPBOARD) {
        const pastedImageContainers = containers.filter(isPastedImageContainer);
        if (pastedImageContainers.length === 1) {
          setFileUploadDataFromPastedImageContainer(pastedImageContainers[0]);
          return;
        }
      }

      shamefulOnUpdateRequest({
        containers: await preprocessContainerUpdates(
          { source, containers },
          sdk
        ),
        source,
        annotations,
        unifiedViewer,
        trackUsage,
      });
    },
    [sdk, unifiedViewer, trackUsage]
  );
};

export default useOnUpdateRequest;
