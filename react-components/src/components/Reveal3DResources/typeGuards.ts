/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AddImage360CollectionEventsOptions,
  type AddImage360CollectionDatamodelsOptions,
  type AddImage360CollectionOptions,
  type AddResourceOptions
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
