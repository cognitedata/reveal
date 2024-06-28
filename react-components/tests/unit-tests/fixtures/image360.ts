import { Image360Collection } from '@cognite/reveal';
import { Mock } from 'moq.ts';

export const image360Options = {
  siteId: 'siteId'
};

export const image360Mock = new Mock<Image360Collection>()
  .setup((p) => p.id)
  .returns(image360Options.siteId)
  .object();
