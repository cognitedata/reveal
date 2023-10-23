import {
  ContainerConfig,
  ContainerType,
  ImageContainerProps,
} from '@cognite/unified-file-viewer';

export const isImageDataUrl = (url: string): boolean =>
  url.startsWith('data:image/');

export const isPastedImageContainer = (
  container: ContainerConfig
): container is ImageContainerProps =>
  // Images pasted from the clipboard don't have metadata attached and are given as data uri's
  container.type === ContainerType.IMAGE &&
  Object.keys(container.metadata).length === 0 &&
  isImageDataUrl(container.url);

export const dataUrlToFile = async (
  dataUrl: string,
  filename: string
): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};
