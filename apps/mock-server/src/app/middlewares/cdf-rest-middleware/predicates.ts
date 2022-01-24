import { Request } from 'express';

/**
 * Checks if the Request is any of the endpoints
 * that are used for fetching resources
 * like: List, Filter, ByIds, Search....etc.
 */
export const isCdfFetchRequest = (
  req: Request<Record<string, unknown>>,
  endpointEnding: string | undefined
) => req.method === 'POST' && endpointEnding;

/**
 * Checks if the request is Delete request
 */
export const isCdfDeleteRequest = (req: Request<Record<string, unknown>>) =>
  req.method === 'POST' && req.url.endsWith('/delete');

/**
 * Checks if the request is POST and it is creating resources
 */
export const isCdfCreateRequest = (req: Request<Record<string, unknown>>) =>
  req.method === 'POST' && req.body && req.body.items;
