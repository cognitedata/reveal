import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient } from '@cognite/sdk/dist/src';
import {
  ContainerConfig,
  ContainerType,
  getAssetTableContainerConfig,
  getContainerConfigFromFileInfo,
  getTimeseriesContainerConfig,
  UnifiedViewerMouseEvent,
} from '@cognite/unified-file-viewer';
import { RevealContainerProps } from '@cognite/unified-file-viewer/dist/core/containers/RevealContainer/RevealContainer';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { ContainerReferenceType } from '../types';
import {
  DEFAULT_ASSET_HEIGHT,
  DEFAULT_ASSET_WIDTH,
  DEFAULT_THREE_D_HEIGHT,
  DEFAULT_THREE_D_WIDTH,
  DEFAULT_TIMESERIES_HEIGHT,
  DEFAULT_TIMESERIES_WIDTH,
} from '../utils/addDimensionsToContainerReferences';
import { getContainerId } from '../utils/utils';
import { UseManagedStateReturnType } from './useManagedState';

const getAssetLabelById = async (
  sdk: CogniteClient,
  assetId: number
): Promise<string> => {
  const asset = await sdk.assets.retrieve([{ id: assetId }]);

  if (asset.length !== 1) {
    throw new Error('Expected to find exactly one asset');
  }

  return asset[0].name ?? asset[0].externalId;
};

type UseShamefullySyncContainerFromContainerReferencesProps = {
  containerReferences: UseManagedStateReturnType['containerReferences'];
  setContainer: Dispatch<SetStateAction<ContainerConfig>>;
  setInteractionState: UseManagedStateReturnType['setInteractionState'];
};

// This is how the flow works when you for instance resize a container:
// - The user resizes a container.
// - UnifiedViewer (UFV) fires an `onUpdateRequest` with the updated container.
// - The `onUpdateRequest` is handled by the `useManagedState` hook, which updates the `container` and `containerReferences` in the state.
// - This hook is triggered (because the `containerReferences` changed), and will update the `container` with the new children asynchronously with values from API calls.
//
// It is not ideal that:
// - there might be a race condition if the user resizes the container multiple times before the API calls are completed.
// - this hook calls the API for all of the containers for new time series data points/file urls/etc on every interaction.
//
// Two approaches to mitigate this would be:
// - Cache the API calls for time series data points/file urls/etc so that we don't call the API multiple times for the same data.
//   - This can be done in the `getContainerConfigFromFileInfo`, `getTimeseriesContainerConfig`, `getAssetTableContainerConfig` etc functions in UFV.
// - Somehow combine the `containerReferences` and `container` states (for instance by creating native CDF containers in UFV) so that we don't have the raise condition.
export const useShamefullySyncContainerFromContainerReferences = ({
  containerReferences,
  setContainer,
  setInteractionState,
}: UseShamefullySyncContainerFromContainerReferencesProps) => {
  const sdk = useSDK();

  useEffect(() => {
    (async () => {
      const children = await Promise.all(
        containerReferences.map(async (containerReference) => {
          const clickHandler = (e: UnifiedViewerMouseEvent) => {
            e.cancelBubble = true;
            setInteractionState({
              hoverId: undefined,
              clickedContainerReferenceId: containerReference.id,
              selectedAnnotationId: undefined,
            });
          };

          if (containerReference.type === ContainerReferenceType.FILE) {
            const fileInfos = await sdk.files.retrieve([
              { id: containerReference.resourceId },
            ]);

            if (fileInfos.length !== 1) {
              throw new Error('Expected to find exactly one file');
            }
            const fileInfo = fileInfos[0];
            return getContainerConfigFromFileInfo(sdk as any, fileInfo, {
              id: getContainerId(containerReference),
              label: fileInfo.name ?? fileInfo.externalId,
              page: containerReference.page,
              x: containerReference.x,
              y: containerReference.y,
              width: containerReference.width,
              height: containerReference.height,
              maxWidth: containerReference.maxWidth,
              maxHeight: containerReference.maxHeight,
              fontSize: 24,
              onClick: clickHandler,
            });
          }

          if (containerReference.type === ContainerReferenceType.TIMESERIES) {
            const timeseries = await sdk.timeseries.retrieve([
              { id: containerReference.resourceId },
            ]);

            if (timeseries.length !== 1) {
              throw new Error('Expected to find exactly one timeseries');
            }

            return getTimeseriesContainerConfig(
              sdk as any,
              {
                id: getContainerId(containerReference),
                label: timeseries[0].name ?? timeseries[0].externalId,
                onClick: clickHandler,
                startDate: containerReference.startDate,
                endDate: containerReference.endDate,
                x: containerReference.x,
                y: containerReference.y,
                width: containerReference.width ?? DEFAULT_TIMESERIES_WIDTH,
                height: containerReference.height ?? DEFAULT_TIMESERIES_HEIGHT,
              },
              {
                timeseriesId: containerReference.resourceId,
              }
            );
          }

          if (containerReference.type === ContainerReferenceType.ASSET) {
            const asset = await sdk.assets.retrieve([
              { id: containerReference.resourceId },
            ]);

            if (asset.length !== 1) {
              throw new Error('Expected to find exactly one asset');
            }

            return getAssetTableContainerConfig(
              sdk as any,
              {
                id: getContainerId(containerReference),
                label: asset[0].name ?? asset[0].externalId,
                onClick: clickHandler,
                x: containerReference.x,
                y: containerReference.y,
                width: containerReference.width ?? DEFAULT_ASSET_WIDTH,
                height: containerReference.height ?? DEFAULT_ASSET_HEIGHT,
              },
              {
                assetId: containerReference.resourceId,
              }
            );
          }

          if (containerReference.type === ContainerReferenceType.THREE_D) {
            const model = await sdk.models3D.retrieve(
              containerReference.modelId
            );

            const maybeAssetName =
              containerReference.initialAssetId !== undefined
                ? await getAssetLabelById(
                    sdk,
                    containerReference.initialAssetId
                  )
                : undefined;

            const modelLabel = model.name ?? model.id;

            const label = maybeAssetName
              ? `${modelLabel} - ${maybeAssetName}`
              : modelLabel;

            const revealContainer: RevealContainerProps = {
              type: ContainerType.REVEAL,
              id: getContainerId(containerReference),
              onClick: clickHandler,
              label,
              modelId: containerReference.modelId,
              revisionId: containerReference.revisionId,
              initialAssetId: containerReference.initialAssetId,
              camera: containerReference.camera,
              x: containerReference.x,
              y: containerReference.y,
              width: containerReference.width ?? DEFAULT_THREE_D_WIDTH,
              height: containerReference.height ?? DEFAULT_THREE_D_HEIGHT,
            };
            return revealContainer;
          }

          throw new Error('Unsupported container reference type');
        })
      );

      setContainer((prevState) => ({
        ...prevState,
        children,
      }));
    })();
  }, [setContainer, sdk, containerReferences, setInteractionState]);
};
