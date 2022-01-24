import { Request } from 'express';
import { CdfDatabaseService } from '../../common/cdf-database.service';
import { CdfApiConfig, CdfMockDatabase, FilterMode } from '../../types';
import {
  flattenNestedObjArray,
  getConfigForUrl,
  mapParamsAsFilter,
  mapRequestBodyToQueryParams,
} from '../../utils';
import uuid from '../../utils/uuid';

/**
 * Modify the initial HTTP request and changes the URL and Method
 * to point to the JsonServer Delete route
 * @param req
 */
export function transformDeleteRequest(
  req: Request<Record<string, unknown>>,
  cdfDb: CdfMockDatabase
) {
  req.method = 'DELETE';
  req.url = req.url.substring(0, req.url.indexOf('/delete'));
  const storeKey = req.url.substring(req.url.lastIndexOf('/') + 1);

  if (storeKey && req.body && req.body.items.length) {
    // quick hack unitl I found a better solution
    const payload = req.body.items[0];
    const objToDelete = CdfDatabaseService.from(cdfDb, storeKey).find(payload);

    if (objToDelete && objToDelete.id) {
      req.url += `/${objToDelete.id}`;
    }
  }
}

/**
 * Modify the initial HTTP request and changes the URL and Method
 * to point to the appropriate JSON server GET route.
 * Used for requests that fetch resources like: List, Search, Filter, ByIds...etc.
 */
export function transformFetchRequest(
  req: Request<Record<string, unknown>>,
  config: CdfApiConfig,
  endpointEnding: string
) {
  endpointEnding = endpointEnding.replace('/', '');

  // get endpoint overrides if any
  const endpointConfig = getConfigForUrl(config, req.url);
  req.method = 'GET';

  let body = req.body;

  if (endpointEnding === 'byids') {
    body = mapParamsAsFilter(flattenNestedObjArray(req.body.items));
  }

  // Convert POST Body request params as GET params needed for json-server
  req.query = mapRequestBodyToQueryParams(
    body,
    endpointEnding as FilterMode,
    endpointConfig
  );
}

/**
 * Transforms the HTTP POST request and adds
 * id, createdTime, lastUpdatedTime, source if they are missing
 * in the request.
 * They are needed in order the data to be stored
 */
export function transformPostCreateRequest(
  req: Request<Record<string, unknown>>
) {
  // quick hack unitl I found a better solution
  const payload = req.body.items[0];
  const currentTimestamp = Date.now();

  if (!payload.id) {
    payload.id = uuid.generate();
  }

  if (!payload.createdTime) {
    payload.createdTime = currentTimestamp;
  }

  if (!payload.lastUpdatedTime) {
    payload.lastUpdatedTime = currentTimestamp;
  }

  if (!payload.source) {
    payload.source = 'mock';
  }

  req.body = payload;
}
