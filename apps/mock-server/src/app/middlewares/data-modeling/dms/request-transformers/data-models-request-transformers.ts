import { CdfMockDatabase } from '../../../../types';
import { isCdfCreateRequest } from '../../../cdf-rest-middleware/predicates';

export const fetchDataModelsRequestTransformers = (
  db: CdfMockDatabase,
  req
) => {
  if (req.url.includes('inlineViews')) {
    delete req.query['inlineViews'];
    req.query['_embed'] = 'views';
    req.url = req.url.substring(0, req.url.indexOf('?'));
    req.method = 'GET';
  }

  if (isCdfCreateRequest(req) && req.body.externalId && !req.body.id) {
    req.body.id = req.body.externalId;
  }
};
