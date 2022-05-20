import { FeatureCollection } from 'geojson';
import isFunction from 'lodash/isFunction';
import { fetchGet } from 'utils/fetch';

export function getMapContent(url: string): Promise<FeatureCollection> {
  return new Promise((resolve) => {
    let networkDataReceived = false;

    const networkUpdate = () =>
      fetch(url)
        .then((response) => {
          // response may be used only once
          // we need to save clone to put one copy in cache
          // and serve second one
          const responseClone = response.clone();

          caches.open('v1').then((cache) => {
            cache.put(url, responseClone);
          });

          if (isFunction(response.json)) {
            return response.json();
          }

          return response.text();
        })
        .then((data) => {
          networkDataReceived = true;
          resolve(data);
        })
        .catch((err) => {
          // generally this only throws from testcafe
          // it is safe to ignore for now
          // since we are moving away from this model anyway
          // and into geospatial layers
          console.error('Map service error:', err, url);
        });

    if (!window?.caches) {
      resolve(fetchGet(url));
    }

    // fetch cached data
    window.caches
      .match(url)
      .then((response) => {
        if (!response) throw Error('No data');
        return response.json();
      })
      .then((data) => {
        if (!networkDataReceived) {
          resolve(data);
        }
      })
      .catch(() => {
        // we didn't get cached data, the network is our last hope:
        networkUpdate();
      });
  });
}
