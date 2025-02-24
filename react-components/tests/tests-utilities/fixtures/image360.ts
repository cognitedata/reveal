import {
  type ClassicDataSourceType,
  type DMDataSourceType,
  type Image360Collection
} from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { vi } from 'vitest';
import { type AddImage360CollectionOptions } from '../../../src';

export const image360ClassicOptions: AddImage360CollectionOptions = {
  source: 'events',
  siteId: 'siteId'
};

export const image360DmOptions: AddImage360CollectionOptions = {
  source: 'cdm',
  externalId: 'testImage360ExternalId',
  space: 'testImage360Space'
};

export const getIconsVisibiltyMock = vi.fn<Image360Collection['getIconsVisibility']>();
export const setIconsVisibilityMock = vi.fn<Image360Collection['setIconsVisibility']>();

export function createImage360ClassicMock(): Image360Collection<ClassicDataSourceType> {
  setIconsVisibilityMock.mockImplementation((visible) => {
    getIconsVisibiltyMock.mockReturnValue(visible);
  });

  return new Mock<Image360Collection<ClassicDataSourceType>>()
    .setup((p) => p.id)
    .returns('siteId')
    .setup((p) => p.getIconsVisibility)
    .returns(getIconsVisibiltyMock)
    .setup((p) => p.setIconsVisibility)
    .returns(setIconsVisibilityMock)
    .object();
}

export function createImage360DmMock(): Image360Collection<DMDataSourceType> {
  return new Mock<Image360Collection<DMDataSourceType>>()
    .setup((p) => p.id)
    .returns('testImage360ExternalId')
    .object();
}
