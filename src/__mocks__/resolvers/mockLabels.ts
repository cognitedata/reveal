import { fixtureLabels } from 'src/__fixtures__/sdk/labels';

export const mockLabelsList = (_req: any, res: any, ctx: any) => {
  return res(ctx.status(200), ctx.json(fixtureLabels.list()));
};
