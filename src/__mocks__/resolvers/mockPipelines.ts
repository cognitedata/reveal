import { fixturePipelines } from 'src/__fixtures__/sdk/pipelines';

export const mockPipelinesList = (_req: any, res: any, ctx: any) => {
  return res(ctx.status(200), ctx.json(fixturePipelines.list()));
};
