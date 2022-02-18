import { Request } from 'express';
import { CdfApiConfig, CdfMockDatabase } from '../../types';
import {
  getConfigForUrl,
  getEndpointEnding,
  shouldUrlBeIgnored,
} from '../../utils';
import {
  isCdfCreateRequest,
  isCdfDeleteRequest,
  isCdfFetchRequest,
} from './predicates';
import {
  transformDeleteRequest,
  transformFetchRequest,
  transformPostCreateRequest,
} from './request-transformers';

/**
 * Intercepts Incomming Requests and map to the appropriate JSON server route
 */
export const requestMiddleware = (
  db: CdfMockDatabase,
  config: CdfApiConfig
) => {
  return (req: Request<Record<string, unknown>>, res, next) => {
    const endpointEnding = getEndpointEnding(req.url);
    // get endpoint overrides if any
    const endpointConfig = getConfigForUrl(config, req.url);

    if (
      endpointConfig &&
      endpointConfig.handler &&
      // eslint-disable-next-line lodash/prefer-lodash-typecheck
      typeof endpointConfig.handler === 'function'
    ) {
      // if we have handler, allow the handler to do the job
      endpointConfig.handler(db, req, res);
    } else if (!shouldUrlBeIgnored(req.url)) {
      // CDF SDK sends almost all requests as POST
      if (isCdfFetchRequest(req, endpointEnding)) {
        transformFetchRequest(req, db, config, endpointEnding);
      } else if (isCdfDeleteRequest(req)) {
        transformDeleteRequest(req, db);
      } else if (isCdfCreateRequest(req)) {
        transformPostCreateRequest(req);
      }
      next();
    } else {
      next();
    }
  };
};
