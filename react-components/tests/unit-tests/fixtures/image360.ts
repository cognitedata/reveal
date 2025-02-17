import { ClassicDataSourceType, DMDataSourceType, type Image360Collection } from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { type AddImage360CollectionOptions } from '../../../src';

export const image360ClassicOptions: AddImage360CollectionOptions = {
  source: 'events',
  siteId: 'siteId'
};

export const image360DmOptions: AddImage360CollectionOptions = {
  source: 'cdm',
  externalId: 'testImage360ExternalId',
  space: 'testImage360Space'
}

export const image360ClassicMock = new Mock<Image360Collection<ClassicDataSourceType>>()
  .setup((p) => p.id)
  .returns(image360ClassicOptions.siteId)
  .object();

  export const image360DmMock = new Mock<Image360Collection<DMDataSourceType>>()
  .setup((p) => p.id)
  .returns(image360DmOptions.externalId)
  .object();
