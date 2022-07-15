import * as React from 'react';
import { useQuery } from 'react-query';

import isString from 'lodash/isString';
import { fetchTenantFile } from 'utils/fetchTenantFile';

import { ProjectConfigMapLayers } from '@cognite/discover-api-types';
import { getProjectInfo } from '@cognite/react-container';
import {
  SelectableLayer,
  MapLayer,
  getBaseLayersArray,
} from '@cognite/react-map';

import { LAYERS_QUERY_KEY } from 'constants/react-query';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { useCategoryLayers } from 'modules/map/hooks/useCategoryLayers';

import { getStaticLayers } from '../utils';

export const isSelectable = (value: unknown) => isString(value);

const convertToLayerConfig = (
  projectConfigLayer: ProjectConfigMapLayers
): SelectableLayer | undefined => {
  if (
    !projectConfigLayer.id ||
    !projectConfigLayer.name ||
    !projectConfigLayer.mapLayers
  ) {
    console.error('Failed to convert layer', projectConfigLayer);
    return undefined;
  }

  const result = {
    ...projectConfigLayer,
    id: projectConfigLayer.id || projectConfigLayer.name,
    name: projectConfigLayer.name,
    disabled: projectConfigLayer.disabled,
    selected: projectConfigLayer.defaultOn || false,
    layers: projectConfigLayer.mapLayers as MapLayer[],
  };

  delete result.mapLayers;

  return result;
};

export const useLayers = (): {
  allLayers: SelectableLayer[];
  alwaysVisible: SelectableLayer[];
  selectableLayers: SelectableLayer[];
  layersReady: boolean;
} => {
  const { data: mapConfig, isFetched: layersReady } =
    useProjectConfigByKey('map');
  const [project] = getProjectInfo();

  const projectConfigLayers =
    mapConfig?.layers?.reduce((result, layer) => {
      if (layer.disabled) {
        return result;
      }

      const layerConfig = convertToLayerConfig(layer);
      if (layerConfig) {
        return [...result, layerConfig];
      }

      return result;
    }, [] as SelectableLayer[]) || [];

  const staticLayers = React.useMemo(() => getStaticLayers(), []);
  const categoryLayers = useCategoryLayers();
  const alwaysOnLayers = getBaseLayersArray(projectConfigLayers);

  // @deprecated old 'tenants' files, use project config mode only now
  const { data: fetchedDeprecatedLayerConfigs } = useQuery(
    LAYERS_QUERY_KEY.ALL,
    () =>
      fetchTenantFile(project, 'layers')
        .then((fetchedLayers) => {
          return Object.values(fetchedLayers).map((remoteLayer) => {
            let safeLayer = remoteLayer as ProjectConfigMapLayers;

            // fix up any old layers that have mising info
            // eg: from files
            if (safeLayer.name && !safeLayer.id) {
              safeLayer = {
                ...safeLayer,
                id: safeLayer.name,
              };
            }

            return convertToLayerConfig(safeLayer);
          });
        })
        .catch((error) => {
          console.error('Error fetching layer file:', error);
        })
  );

  const safeFetchedDeprecatedLayerConfigs =
    fetchedDeprecatedLayerConfigs && fetchedDeprecatedLayerConfigs.length > 0
      ? (fetchedDeprecatedLayerConfigs as SelectableLayer[])
      : [];

  const layerResponse = {
    allLayers: [
      ...projectConfigLayers,
      ...alwaysOnLayers,
      ...categoryLayers,
      ...safeFetchedDeprecatedLayerConfigs,
      staticLayers,
    ],
    // these layers get put into the menu for selection
    // (so only add the ones that are NOT always on)
    selectableLayers: [
      ...projectConfigLayers,
      ...categoryLayers,
      ...safeFetchedDeprecatedLayerConfigs,
    ],
    // these layers don't get put into the menu for selection
    // but directly sent to the map
    alwaysVisible: [staticLayers, ...alwaysOnLayers],
    layersReady,
  };

  // console.log('Final layerResponse:', layerResponse);
  return layerResponse;
};
