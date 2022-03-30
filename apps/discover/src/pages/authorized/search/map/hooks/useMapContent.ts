import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { FeatureCollection } from '@turf/helpers';
import isUndefined from 'lodash/isUndefined';
import { geospatialV1 } from 'services/geospatial/geospatialV1';
import { useJsonHeaders } from 'services/service';
import {
  CancellablePromise,
  convertToCancellablePromise,
} from 'utils/cancellablePromise';
import { fetchTenantFile } from 'utils/fetchTenantFile';
import { log } from 'utils/log';
import { handleServiceError } from 'utils/service/handleServiceError';

import { ProjectConfigMapLayers } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { setSources, setAssets } from 'modules/map/actions';
import { useMap } from 'modules/map/selectors';
import { mapService } from 'modules/map/service';
import { MapDataSource } from 'modules/map/types';
import { LegacyLayer } from 'tenants/types';

import { getAssetFilter, getAssetData } from '../utils';

import { useLayers } from './useLayers';

export const useMapContent = () => {
  const { layers, layersReady } = useLayers();
  const [tenant] = getTenantInfo();
  const { sources } = useMap();
  const dispatch = useDispatch();
  const headers = useJsonHeaders();

  useEffect(() => {
    const tempSources: MapDataSource[] = [];
    const promises: Promise<void>[] = [];
    let cancellablePromise: CancellablePromise | undefined;

    if (layersReady && !sources) {
      Object.keys(layers).forEach((id) => {
        // console.log('Adding layer:', id);
        const { remote, remoteService, local, asset } = layers[
          id
        ] as LegacyLayer;

        const pushResponse = (content: FeatureCollection) => {
          tempSources.push({ id, data: content });
          if (asset) {
            const filter = getAssetFilter(asset.filter);
            const assetData = getAssetData(content, asset.displayField, filter);
            dispatch(setAssets(assetData));
          }
        };

        if (local) {
          promises.push(
            fetchTenantFile(tenant, local).then((content) => {
              pushResponse(content);
            })
          );
        }
        if (remote) {
          promises.push(
            mapService.getMapContent(remote).then((content) => {
              pushResponse(content);
            })
          );
        }

        if (remoteService) {
          promises.push(
            remoteService(tenant, headers).then(
              (content: FeatureCollection) => {
                // console.log('Adding remote service layer:', content);
                pushResponse(content);
              }
            )
          );
        }

        if (!isUndefined((layers[id] as ProjectConfigMapLayers).disabled)) {
          promises.push(
            geospatialV1.getGeoJSON(id).then((geoJSON) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore need to update FeatureCollection to be used from geojson
              pushResponse(geoJSON);
            })
          );
        }
      });

      if (promises.length > 0) {
        cancellablePromise = convertToCancellablePromise(Promise.all(promises));
        cancellablePromise.promise
          .then(() => {
            dispatch(setSources(tempSources));
          })
          .catch((error) => {
            log('Some layers failed to load');
            handleServiceError(error);
          });
      } else {
        dispatch(setSources([]));
      }
    }
    return () => {
      cancellablePromise?.cancel();
    };
  }, [layers, layersReady]);

  return sources;
};
