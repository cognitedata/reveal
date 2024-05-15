/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AddImageCollection360DatamodelsOptions,
  type AddImageCollection360Options,
  type AddResourceOptions,
  type AddReveal3DModelOptions
} from './types';

export function is360ImageAddOptions(
  addOptions: AddResourceOptions
): addOptions is AddImageCollection360Options {
  return (
    (addOptions as AddReveal3DModelOptions).modelId === undefined &&
    (addOptions as AddReveal3DModelOptions).revisionId === undefined
  );
}

export function is3dModelOptions(
  addOptions: AddResourceOptions
): addOptions is AddReveal3DModelOptions {
  return (
    (addOptions as AddReveal3DModelOptions).modelId !== undefined &&
    (addOptions as AddReveal3DModelOptions).revisionId !== undefined
  );
}

export function is360ImageDataModelAddOptions(
  addOptions: AddImageCollection360Options
): addOptions is AddImageCollection360DatamodelsOptions {
  const castOptions = addOptions as AddImageCollection360DatamodelsOptions;
  return castOptions.externalId !== undefined && castOptions.space !== undefined;
}
