import { type Image360Collection } from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { type AddImage360CollectionOptions } from '../../../src';

export const image360Options: AddImage360CollectionOptions = {
  source: 'events',
  siteId: 'siteId'
};

export const image360Mock = new Mock<Image360Collection>()
  .setup((p) => p.id)
  .returns(image360Options.siteId)
  .object();
