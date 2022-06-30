import { getEndpointEnding, shouldUrlBeIgnored } from '../../utils';
import {
  transformGetRequest,
  transformPostPutRequest,
} from './response-transformers';

/**
 * Intercept Response and transform the response into
 * CDF like response
 */
export const responseMiddleware = (req, res, next) => {
  const endpointEnding = getEndpointEnding(req.url);

  if (shouldUrlBeIgnored(req.url)) {
    next();
    return;
  }

  if (endpointEnding && req.method === 'GET') {
    transformGetRequest(req, res);
  } else if (
    ((req.method === 'POST' || req.method === 'PUT') &&
      res.statusCode === 200) ||
    res.statusCode === 201
  ) {
    transformPostPutRequest(req, res);
  }
  next();
};
