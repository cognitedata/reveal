import { fixtureClassifier } from 'apps/cdf-document-search/src/__fixtures__/sdk/classifier';

export const mockClassifiersList = (_req: any, res: any, ctx: any) => {
  return res(ctx.status(200), ctx.json(fixtureClassifier.list()));
};
