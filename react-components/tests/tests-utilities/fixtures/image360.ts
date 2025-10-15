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
  siteId?: string;
  visible?: boolean;
}): Image360Collection {
  let isIconsVisibility = parameters?.visible ?? true;
  let isOccludedIconsVisible = true;
  let iconsOpacity = 1;
  let imagesOpacity = 1;

  const getIconsVisibilityMock = vi
    .fn<Image360Collection['getIconsVisibility']>()
    .mockReturnValue(isIconsVisibility);

  const setIconsVisibilityMock = vi
    .fn<Image360Collection['setIconsVisibility']>()
    .mockImplementation((visible) => {
      isIconsVisibility = visible;
      getIconsVisibilityMock.mockReturnValue(visible);
    });

  const onEventMock =
    vi.fn<(event: 'image360Entered' | 'image360Exited', callback: () => void) => void>();
  const offEventMock =
    vi.fn<(event: 'image360Entered' | 'image360Exited', callback: () => void) => void>();

  return (
    new Mock<Image360Collection<ClassicDataSourceType>>()
      .setup((p) => p.id)
      .returns(parameters?.siteId ?? 'siteId')
      .setup((p) => p.label)
      .returns('360 Model Name')
      .setup((p) => p.getIconsVisibility)
      .returns(getIconsVisibilityMock)
      .setup((p) => p.setIconsVisibility)
      .returns(setIconsVisibilityMock)
      .setup((p) => p.on)
      .returns(onEventMock)
      .setup((p) => p.off)
      .returns(offEventMock)
      .setup((p) => p.findImageAnnotations)
      .returns(findImageAnnotationsMock)

      // Get and set OccludedIconsVisible
      .setup((p) => p.isOccludedIconsVisible)
      .callback(() => {
        return () => isOccludedIconsVisible;
      })
      .setup((p) => p.setOccludedIconsVisible)
      .returns((value: boolean) => {
        isOccludedIconsVisible = value;
      })
      // Get and set IconsOpacity
      .setup((p) => p.getIconsOpacity)
      .callback(() => {
        return () => iconsOpacity;
      })
      .setup((p) => p.setIconsOpacity)
      .returns((value: number) => {
        iconsOpacity = value;
      })
      // Get and set ImagesOpacity
      .setup((p) => p.getImagesOpacity)
      .callback(() => {
        return () => imagesOpacity;
      })
      .setup((p) => p.setImagesOpacity)
      .returns((value: number) => {
        imagesOpacity = value;
      })
      .object()
  );
}

export function createImage360DmMock(parameters?: {
  visible?: boolean;
}): Image360Collection<DMDataSourceType> {
  let isIconsVisibility = parameters?.visible ?? true;
  let isOccludedIconsVisible = true;
  let iconsOpacity = 1;
  let imagesOpacity = 1;

  const getIconsVisibilityMock = vi
    .fn<Image360Collection['getIconsVisibility']>()
    .mockReturnValue(isIconsVisibility);

  const setIconsVisibilityMock = vi
    .fn<Image360Collection['setIconsVisibility']>()
    .mockImplementation((visible) => {
      isIconsVisibility = visible;
      getIconsVisibilityMock.mockReturnValue(visible);
    });

  const onEventMock =
    vi.fn<(event: 'image360Entered' | 'image360Exited', callback: () => void) => void>();
  const offEventMock =
    vi.fn<(event: 'image360Entered' | 'image360Exited', callback: () => void) => void>();

  return (
    new Mock<Image360Collection<DMDataSourceType>>()
      .setup((p) => p.id)
      .returns('testImage360ExternalId')
      .setup((p) => p.label)
      .returns('360 Model Name')
      .setup((p) => p.getIconsVisibility)
      .returns(getIconsVisibilityMock)
      .setup((p) => p.setIconsVisibility)
      .returns(setIconsVisibilityMock)
      .setup((p) => p.on)
      .returns(onEventMock)
      .setup((p) => p.off)
      .returns(offEventMock)

      // Get and set OccludedIconsVisible
      .setup((p) => p.isOccludedIconsVisible)
      .callback(() => {
        return () => isOccludedIconsVisible;
      })
      .setup((p) => p.setOccludedIconsVisible)
      .returns((value: boolean) => {
        isOccludedIconsVisible = value;
      })
      // Get and set IconsOpacity
      .setup((p) => p.getIconsOpacity)
      .callback(() => {
        return () => iconsOpacity;
      })
      .setup((p) => p.setIconsOpacity)
      .returns((value: number) => {
        iconsOpacity = value;
      })
      // Get and set ImagesOpacity
      .setup((p) => p.getImagesOpacity)
      .callback(() => {
        return () => imagesOpacity;
      })
      .setup((p) => p.setImagesOpacity)
      .returns((value: number) => {
        imagesOpacity = value;
      })

      .object()
  );
}
