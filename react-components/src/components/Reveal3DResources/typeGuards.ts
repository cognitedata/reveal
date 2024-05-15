/*!
 * Copyright 2024 Cognite AS
 */
import {
  AddImageCollection360EventsOptions,
  type AddImageCollection360DatamodelsOptions,
  type AddImageCollection360Options,
  type AddResourceOptions,
  type AddReveal3DModelOptions
} from './types';

export function is360ImageAddOptions(
  addOptions: AddResourceOptions
): addOptions is AddImageCollection360Options {
  return !is3dModelOptions(addOptions);
}

export function is3dModelOptions(
  addOptions: AddResourceOptions
): addOptions is AddReveal3DModelOptions {
  const modelOptions = addOptions as AddReveal3DModelOptions;
  return modelOptions.modelId !== undefined && modelOptions.revisionId !== undefined;
}

export function is360ImageDataModelAddOptions(
  addOptions: AddImageCollection360Options
): addOptions is AddImageCollection360DatamodelsOptions {
  const castOptions = addOptions as AddImageCollection360DatamodelsOptions;
  return castOptions.externalId !== undefined && castOptions.space !== undefined;
}

export function is360ImageEventsAddOptions(
  addOptions: AddImageCollection360Options
): addOptions is AddImageCollection360EventsOptions {
  const castOptions = addOptions as AddImageCollection360EventsOptions;
  return castOptions.siteId !== undefined;
}
