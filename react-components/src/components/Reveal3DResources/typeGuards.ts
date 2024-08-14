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
  return (
    is360ImageDataModelAddOptions(addOptions as AddImage360CollectionOptions) ||
    is360ImageEventsAddOptions(addOptions as AddImage360CollectionOptions)
  );
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
