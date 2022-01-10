import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { FeatureCollection } from '@turf/helpers';
import isUndefined from 'lodash/isUndefined';
import {
  CancellablePromise,
  convertToCancellablePromise,
} from 'utils/cancellablePromise';
import { fetchTenantFile } from 'utils/fetchTenantFile';
import { log } from 'utils/log';

import { getTenantInfo } from '@cognite/react-container';
import { reportException } from '@cognite/react-errors';

import { geospatialV1 } from 'modules/api/geospatial/geospatialV1';
import { setSources, patchSource, setAssets } from 'modules/map/actions';
import { useMap } from 'modules/map/selectors';
import { mapService } from 'modules/map/service';
import { MapDataSource } from 'modules/map/types';
import { RemoteServiceResponse } from 'tenants/types';

import { useJsonHeaders } from '../../../../../modules/api/service';
import { getAssetFilter, getAssetData } from '../utils';

import { useLayers } from './useLayers';

export const useMapContent = () => {
  const { layers, layersReady } = useLayers();
  const [tenant] = getTenantInfo();
  const { sources } = useMap();
  const dispatch = useDispatch();
  const headers = useJsonHeaders();

  const startLazyLoad = (lazyIds: [string, string][]) => {
    lazyIds.forEach(async (lazyId) => {
      const [id, cursor] = lazyId;
      const service = layers[id].remoteService;
      let nextCursor: string | undefined = cursor;
      while (nextCursor && service) {
        // eslint-disable-next-line no-await-in-loop
        const response: RemoteServiceResponse = await service(tenant, headers);
        dispatch(
          patchSource({
            id,
            data: response,
          })
        );
        nextCursor = response.nextCursor;
      }
    });
  };

  useEffect(() => {
    const tempSources: MapDataSource[] = [];
    const promises: Promise<void>[] = [];
    let cancellablePromise: CancellablePromise | undefined;
    const lazyIds: [string, string][] = [];

    if (layersReady && !sources) {
      Object.keys(layers).forEach((id) => {
        const { remote, remoteService, local, asset, disabled, name } =
          layers[id];

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
                pushResponse(content);
              }
            )
          );
        }
        if (!isUndefined(disabled)) {
          promises.push(
            geospatialV1.getGeoJSON(name).then((geoJSON) => {
              // eslint-disable-next-line
              // @ts-ignore geometry property will match after v7 sdk
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

            // it is always empty array: remove this
            startLazyLoad(lazyIds);
          })
          .catch((error) => {
            log('Some layers failed to load');
            reportException(error);
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
