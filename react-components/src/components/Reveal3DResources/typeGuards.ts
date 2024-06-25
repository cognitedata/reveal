/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AddImage360CollectionEventsOptions,
  type AddImage360CollectionDatamodelsOptions,
  type AddImage360CollectionOptions,
  type AddResourceOptions,
  type AddReveal3DModelOptions
} from './types';

export function is360ImageAddOptions(
  addOptions: AddResourceOptions
): addOptions is AddImage360CollectionOptions {
  return !is3dModelOptions(addOptions);
}

export function is3dModelOptions(
  addOptions: AddResourceOptions
): addOptions is AddReveal3DModelOptions {
  const modelOptions = addOptions as AddReveal3DModelOptions;
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
