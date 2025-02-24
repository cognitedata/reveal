/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useMemo } from 'react';
import { type Reveal3DResourcesProps, type CadModelOptions } from './types';
import { isAssetMappingStylingGroup } from '../../utilities/StylingGroupUtils';
import { type ImageCollectionModelStyling } from '../Image360CollectionContainer/useApply360AnnotationStyling';
import { is360ImageAddOptions, isClassicIdentifier } from './typeGuards';
import { type CadModelStyling } from '../CadModelContainer/types';
import { type PointCloudModelStyling } from '../PointCloudContainer/types';
import { use3DResourcesViewModel } from './Reveal3DResources.viewmodel';
import { createEmptyArray } from '../../utilities/createEmptyArray';

export const Reveal3DResources = ({
  resources,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError,
  onResourceIsLoaded,
  image360Settings
}: Reveal3DResourcesProps): ReactElement => {
  const { CadModelContainer, Image360CollectionContainer, PointCloudContainer, ...hooks } =
    use3DResourcesViewModel();

  const renderTarget = hooks.useRenderTarget();
  const viewer = hooks.useReveal();

  hooks.useRemoveNonReferencedModels(resources, renderTarget);

  const { data: reveal3DModels } = hooks.useTypedModels(viewer, resources, onResourceLoadError);

  hooks.useSetExpectedLoadCount(resources);
  hooks.useCallCallbackOnFinishedLoading(resources, onResourcesAdded);

  const image360CollectionAddOptions = useMemo(() => {
    return resources
      .filter(is360ImageAddOptions)
      .map((options) => ({ ...image360Settings, ...options }));
  }, [resources, image360Settings]);

  const cadModelOptions = useMemo(() => {
    if (reveal3DModels === undefined) {
      return createEmptyArray();
    }
    return reveal3DModels.filter((model): model is CadModelOptions => model.type === 'cad');
  }, [reveal3DModels]);

  const { data: assetMappings } = hooks.useAssetMappedNodesForRevisions(cadModelOptions);

  hooks.useGenerateAssetMappingCachePerItemFromModelCache(cadModelOptions, assetMappings);
  hooks.useGenerateNode3DCache(cadModelOptions, assetMappings);

  const instanceStylingWithAssetMappings =
    instanceStyling?.filter(isAssetMappingStylingGroup) ?? createEmptyArray();

  const { styledModels: styledCadModelOptions, isModelMappingsLoading } =
    hooks.useCalculateCadStyling(
      cadModelOptions,
      instanceStylingWithAssetMappings,
      defaultResourceStyling
    );

  const setModel3DStylingLoading = hooks.useReveal3DResourcesStylingLoadingSetter();

  useEffect(() => {
    setModel3DStylingLoading(isModelMappingsLoading);
  }, [isModelMappingsLoading]);

  const styledPointCloudModelOptions = hooks.useCalculatePointCloudStyling(
    reveal3DModels ?? createEmptyArray(),
    instanceStylingWithAssetMappings,
    defaultResourceStyling
  );

  const image360StyledGroup = hooks.useCalculateImage360Styling(instanceStyling);

  return (
    <>
      {styledCadModelOptions.map(({ styleGroups, model }, index) => {
        const defaultStyle = model.styling?.default ?? defaultResourceStyling?.cad?.default;
        const cadStyling: CadModelStyling = {
          defaultStyle,
          groups: styleGroups
        };
        return (
          <CadModelContainer
            key={`${model.modelId}/${model.revisionId}/${index}`}
            addModelOptions={model}
            styling={cadStyling}
            transform={model.transform}
            onLoad={onResourceIsLoaded}
            onLoadError={onResourceLoadError}
          />
        );
      })}
      {styledPointCloudModelOptions.map(({ styleGroups, model }, index) => {
        const defaultStyle = model.styling?.default ?? defaultResourceStyling?.pointcloud?.default;
        const pcStyling: PointCloudModelStyling = {
          defaultStyle,
          groups: styleGroups
        };
        let key;
        if (isClassicIdentifier(model)) {
          key = `${model.modelId}/${model.revisionId}/${index}`;
        } else {
          key = `${model.revisionExternalId}/${model.revisionSpace}/${index}`;
        }
        return (
          <PointCloudContainer
            key={key}
            addModelOptions={model}
            styling={pcStyling}
            transform={model.transform}
            onLoad={onResourceIsLoaded}
            onLoadError={onResourceLoadError}
          />
        );
      })}
      {image360CollectionAddOptions.map((addModelOption) => {
        const image360Styling: ImageCollectionModelStyling = {
          defaultStyle: defaultResourceStyling?.image360?.default,
          groups: image360StyledGroup
        };
        let key;
        if ('siteId' in addModelOption) {
          key = `${addModelOption.siteId}`;
        } else if ('externalId' in addModelOption) {
          key = `${addModelOption.externalId}`;
        }

        if ('externalId' in addModelOption || 'siteId' in addModelOption) {
          return (
            <Image360CollectionContainer
              key={key}
              addImage360CollectionOptions={addModelOption}
              styling={image360Styling}
              onLoad={onResourceIsLoaded}
              onLoadError={onResourceLoadError}
            />
          );
        }
        return <></>;
      })}
    </>
  );
};
