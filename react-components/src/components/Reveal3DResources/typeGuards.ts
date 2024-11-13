/*!
 * Copyright 2024 Cognite AS
 */
import {
  type DMDataSourceType,
  type ClassicDataSourceType,
  type AddModelOptions
} from '@cognite/reveal';
import {
  type AddImage360CollectionEventsOptions,
  type AddImage360CollectionDatamodelsOptions,
  type AddImage360CollectionOptions,
  type AddResourceOptions,
  type AddPointCloudResourceOptions
} from './types';

export function is360ImageAddOptions(
  addOptions: AddResourceOptions
): addOptions is AddImage360CollectionOptions {
  return is360ImageDataModelAddOptions(addOptions) || is360ImageEventsAddOptions(addOptions);
}

export function is360ImageDataModelAddOptions(
  addOptions: AddResourceOptions
): addOptions is AddImage360CollectionDatamodelsOptions {
  const castOptions = addOptions as AddImage360CollectionDatamodelsOptions;
  return castOptions.externalId !== undefined && castOptions.space !== undefined;
}

export function is360ImageEventsAddOptions(
  addOptions: AddResourceOptions
): addOptions is AddImage360CollectionEventsOptions {
  const castOptions = addOptions as AddImage360CollectionEventsOptions;
  return castOptions.siteId !== undefined;
}

export function isClassicIdentifier(
  addOptions: AddResourceOptions
): addOptions is AddPointCloudResourceOptions & AddModelOptions<ClassicDataSourceType> {
  const castOptions = addOptions as AddModelOptions<ClassicDataSourceType>;
  return castOptions.modelId !== undefined && castOptions.revisionId !== undefined;
}

export function isDMIdentifier(
  addOptions: AddResourceOptions
): addOptions is AddPointCloudResourceOptions & AddModelOptions<DMDataSourceType> {
  const castOptions = addOptions as AddModelOptions<DMDataSourceType>;
  return castOptions.revisionExternalId !== undefined && castOptions.revisionSpace !== undefined;
}
