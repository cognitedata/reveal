/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AddImage360CollectionEventsOptions,
  type AddImage360CollectionDatamodelsOptions,
  type AddImage360CollectionOptions,
  type AddResourceOptions,
  type Add3dResourceOptions
} from './types';

export function is360ImageAddOptions(
  addOptions: AddResourceOptions
): addOptions is AddImage360CollectionOptions {
  return !is3dResourceOptions(addOptions);
}

export function is3dResourceOptions(
  addOptions: AddResourceOptions
): addOptions is Add3dResourceOptions {
  const modelOptions = addOptions as Add3dResourceOptions;
  return modelOptions.modelId !== undefined && modelOptions.revisionId !== undefined;
}

export function is360ImageDataModelAddOptions(
  addOptions: AddImage360CollectionOptions
): addOptions is AddImage360CollectionDatamodelsOptions {
  const castOptions = addOptions as AddImage360CollectionDatamodelsOptions;
  return castOptions.externalId !== undefined && castOptions.space !== undefined;
}

export function is360ImageEventsAddOptions(
  addOptions: AddImage360CollectionOptions
): addOptions is AddImage360CollectionEventsOptions {
  const castOptions = addOptions as AddImage360CollectionEventsOptions;
  return castOptions.siteId !== undefined;
}
