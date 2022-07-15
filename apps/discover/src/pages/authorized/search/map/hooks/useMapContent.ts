import { getGeoJSON } from 'domain/geospatial/service/network';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { FeatureCollection } from 'geojson';
import { handleServiceError } from 'utils/errors';
import { fetchTenantFile } from 'utils/fetchTenantFile';
import { log } from 'utils/log';

import { getProjectInfo } from '@cognite/react-container';

import { setSources, setAssets } from 'modules/map/actions';
import { useMap } from 'modules/map/selectors';
import { mapService } from 'modules/map/service';
import { MapDataSource } from 'modules/map/types';

import { getAssetFilter, getAssetData } from '../utils';

import { useLayers } from './useLayers';

export const useMapContent = () => {
  const { allLayers, layersReady } = useLayers();
  const [tenant] = getProjectInfo();
  const { sources } = useMap();
  const dispatch = useDispatch();

  // make a nice layer list id, so that the useEffect is stable
  const layerList = allLayers.map((layer) => layer.id).join('');

  useEffect(() => {
    const tempSources: MapDataSource[] = [];
    const promises: Promise<void>[] = [];

    // if we want the BP layers back, we can enable this:
    // const notAllSourcesLoaded = (sources?.length || 0) <= allLayers.length;
    // this is the old check, but it has some edge cases
    // eg: if some sources load, but some do not (eg: remove)
    // then this will pass and ignore the pending remote
    // this is ok for now as i want to test removing the current (july 15 2022)
    // BP remote layers
    const notAllSourcesLoaded = !sources;

    if (layersReady && notAllSourcesLoaded) {
      allLayers.forEach((layer) => {
        // console.log('Trying to add layer:', layer);
        const { remote, local, asset } = layer;

        const pushResponse = (content: FeatureCollection) => {
          tempSources.push({ id: layer.id, data: content });
          if (asset) {
            const filter = getAssetFilter(asset.filter);
            const assetData = getAssetData(
              content,
              asset.displayField || 'Unknown',
              filter
            );
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

        if (!layer.disabled && layer.featureTypeId) {
          promises.push(
            getGeoJSON(layer.featureTypeId)
              .then((geoJSON) => {
                pushResponse(geoJSON);
              })
              .catch((error) => {
                log('Could not load layer from geospatial');
                handleServiceError(error);
              })
          );
        }
      });

      if (promises.length > 0) {
        Promise.all(promises)
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
  }, [layerList, layersReady]);

  return sources;
};
