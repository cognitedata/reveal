import { Router } from 'express';
import { rewriter } from 'json-server';
import { CdfApiConfig, CdfMockDatabase, CdfServerRouter } from '../../types';
import { responseMiddleware } from './response-middleware';
import { requestMiddleware } from './request-middleware';

export default function (db: CdfMockDatabase, config?: CdfApiConfig) {
  // Create router
  const cdfRouter = Router();

  // Use request middleware to convert cdf like request
  // to JSON server request
  cdfRouter.use(requestMiddleware(db, config));

  // Use response middleware to convert JSON server response
  // to be CDF like response
  cdfRouter.use(responseMiddleware);

  // Rewrite the endpoints to use the CDF convention
  cdfRouter.use(rewriter(config.urlRewrites));

  return cdfRouter as CdfServerRouter;
}
