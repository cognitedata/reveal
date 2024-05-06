/*!
 * Copyright 2024 Cognite AS
 */
import { type GeometryFilter } from '@cognite/reveal';
import {
  type AddResourceOptions,
  type AddReveal3DModelOptions,
  type AddImageCollection360Options,
  type AddImageCollection360DatamodelsOptions,
  type AddImageCollection360EventsOptions
} from '../components/Reveal3DResources/types';
import { is3dModelOptions } from '../components/Reveal3DResources/utils';
import { type Matrix4 } from 'three';

export function isSameModel(model0: AddResourceOptions, model1: AddResourceOptions): boolean {
  if (is3dModelOptions(model0) && is3dModelOptions(model1)) {
    return isSame3dModel(model0, model1);
  }

  if (is360ImageCollectionOptions(model0) && is360ImageCollectionOptions(model1)) {
    return isSame360ImageOptions(model0, model1);
  }

  return false;
}

function isSame360ImageOptions(
  options0: AddImageCollection360Options,
  options1: AddImageCollection360Options
): boolean {
  if (is360EventCollection(options0) && is360EventCollection(options1)) {
    return (
      options0.siteId === options1.siteId && isSameTransform(options0.transform, options1.transform)
    );
  }

  if (is360DataModelCollection(options0) && is360DataModelCollection(options1)) {
    return (
      options0.externalId === options1.externalId &&
      options0.space === options1.space &&
      isSameTransform(options0.transform, options1.transform)
    );
  }

  return false;
}

export function isSame3dModel(
  model0: AddReveal3DModelOptions,
  model1: AddReveal3DModelOptions
): boolean {
  return (
    model0.modelId === model1.modelId &&
    model0.revisionId === model1.revisionId &&
    isSameTransform(model0.transform, model1.transform) &&
    isSameGeometryFilter(model0.geometryFilter, model1.geometryFilter)
  );
}

function isSameTransform(matrix0: Matrix4 | undefined, matrix1: Matrix4 | undefined): boolean {
  return (
    matrix0 === matrix1 ||
    (matrix0 !== undefined && matrix1 !== undefined && matrix0.equals(matrix1))
  );
}

function isSameGeometryFilter(
  filter0: GeometryFilter | undefined,
  filter1: GeometryFilter | undefined
): boolean {
  if (filter0 === filter1) {
    return true;
  }

  if (filter0 === undefined || filter1 === undefined) {
    return false;
  }

  if (filter0.boundingBox === filter1.boundingBox) {
    return true;
  }

  if (filter0.boundingBox === undefined || filter1.boundingBox === undefined) {
    return false;
  }

  return (
    filter0.boundingBox.equals(filter1.boundingBox) &&
    filter0.isBoundingBoxInModelCoordinates === filter1.isBoundingBoxInModelCoordinates
  );
}

export function is360ImageCollectionOptions(
  addOptions: AddResourceOptions
): addOptions is AddImageCollection360Options {
  return is360EventCollection(addOptions) || is360DataModelCollection(addOptions);
}

export function is360EventCollection(
  addOptions: AddResourceOptions
): addOptions is AddImageCollection360EventsOptions {
  return (addOptions as AddImageCollection360EventsOptions).siteId !== undefined;
}

export function is360DataModelCollection(
  addOptions: AddResourceOptions
): addOptions is AddImageCollection360DatamodelsOptions {
  const asDataModelOptions = addOptions as AddImageCollection360DatamodelsOptions;
  return asDataModelOptions.externalId !== undefined && asDataModelOptions.space !== undefined;
}
