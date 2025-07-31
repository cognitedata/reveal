import {
  type ClassicDataSourceType,
  type DMDataSourceType,
  type Image360Collection
} from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { vi } from 'vitest';
import {
  type AddImage360CollectionDatamodelsOptions,
  type AddImage360CollectionEventsOptions,
  type TaggedAddImage360CollectionOptions
} from '../../../src/components/Reveal3DResources';

export const image360ClassicOptions: AddImage360CollectionEventsOptions = {
  source: 'events',
  siteId: 'siteId'
};

export const image360DmOptions: AddImage360CollectionDatamodelsOptions = {
  source: 'cdm',
  externalId: 'testImage360ExternalId',
  space: 'testImage360Space'
};

export const taggedImage360ClassicOptions = {
  type: 'image360',
  addOptions: image360ClassicOptions
} as const satisfies TaggedAddImage360CollectionOptions;

export const taggedImage360DmOptions = {
  type: 'image360',
  addOptions: image360DmOptions
} as const satisfies TaggedAddImage360CollectionOptions;

export const findImageAnnotationsMock = vi
  .fn<Image360Collection<ClassicDataSourceType>['findImageAnnotations']>()
  .mockResolvedValue([]);

export function createImage360ClassicMock(parameters?: {
  visible?: boolean;
}): Image360Collection<ClassicDataSourceType> {
  const getIconsVisibilityMock = vi
    .fn<Image360Collection['getIconsVisibility']>()
    .mockReturnValue(parameters?.visible ?? true);

  const setIconsVisibilityMock = vi
    .fn<Image360Collection['setIconsVisibility']>()
    .mockImplementation((visible) => {
      getIconsVisibilityMock.mockReturnValue(visible);
    });

  const onEventMock =
    vi.fn<(event: 'image360Entered' | 'image360Exited', callback: () => void) => void>();
  const offEventMock =
    vi.fn<(event: 'image360Entered' | 'image360Exited', callback: () => void) => void>();

  return new Mock<Image360Collection<ClassicDataSourceType>>()
    .setup((p) => p.id)
    .returns('siteId')
    .setup((p) => p.getIconsVisibility)
    .returns(getIconsVisibilityMock)
    .setup((p) => p.label)
    .returns('360 Model Name')
    .setup((p) => p.setIconsVisibility)
    .returns(setIconsVisibilityMock)
    .setup((p) => p.on)
    .returns(onEventMock)
    .setup((p) => p.off)
    .returns(offEventMock)
    .setup((p) => p.findImageAnnotations)
    .returns(findImageAnnotationsMock)
    .object();
}

export function createImage360DmMock(): Image360Collection<DMDataSourceType> {
  const onEventMock =
    vi.fn<(event: 'image360Entered' | 'image360Exited', callback: () => void) => void>();
  const offEventMock =
    vi.fn<(event: 'image360Entered' | 'image360Exited', callback: () => void) => void>();

  return new Mock<Image360Collection<DMDataSourceType>>()
    .setup((p) => p.id)
    .returns('testImage360ExternalId')
    .setup((p) => p.on)
    .returns(onEventMock)
    .setup((p) => p.off)
    .returns(offEventMock)
    .object();
}
