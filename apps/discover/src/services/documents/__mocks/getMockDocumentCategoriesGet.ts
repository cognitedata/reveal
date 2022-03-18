import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { DocumentCategories } from '@cognite/discover-api-types';

import { getMockDocumentCategories } from '__test-utils/fixtures/documentCategories';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: DocumentCategories = getMockDocumentCategories();
const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/document/categories`;

export const getMockDocumentCategoriesGet = (): MSWRequest => {
  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};

export const getMockDocumentCategoriesResult = (extras?: any): MSWRequest => {
  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json({ data: responseData, ...extras }));
  });
};
