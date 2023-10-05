import { rest, RequestHandler } from 'msw';

import { TEST_BASE_URL } from '../../../../tests/testConstants';
import { MOCK_CAPABILITIES } from '../__fixtures/capabilities';

const inspectUrl = `${TEST_BASE_URL}/api/v1/token/inspect`;

export const getMockCapabilities = (): RequestHandler<any, any, any, any> => {
  return rest.get<Request>(inspectUrl, (_req, res, ctx) => {
    return res(ctx.json({ capabilities: MOCK_CAPABILITIES }));
  });
};
