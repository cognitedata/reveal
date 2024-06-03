/*!
 * Copyright 2024 Cognite AS
 */
import { type GeometryFilter } from '@cognite/reveal';
import {
  type PointCloudModelOptions,
  type CadModelOptions
} from '../components/Reveal3DResources/types';
import { Matrix4 } from 'three';

export function isSameCadModel(model0: CadModelOptions, model1: CadModelOptions): boolean {
  return (
    model0.modelId === model1.modelId &&
    model0.revisionId === model1.revisionId &&
    isSameTransform(model0.transform, model1.transform) &&
    isSameGeometryFilter(model0.geometryFilter, model1.geometryFilter)
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

export function isSamePointCloudModel(
  model0: PointCloudModelOptions,
  model1: PointCloudModelOptions
): boolean {
  return (
    model0.modelId === model1.modelId &&
    model0.revisionId === model1.revisionId &&
    isSameTransform(model0.transform, model1.transform)
  );
}

const identity = new Matrix4();

function isSameTransform(m0: Matrix4 | undefined, m1: Matrix4 | undefined): boolean {
  if ((m0 === undefined || m0.equals(identity)) && (m1 === undefined || m1.equals(identity))) {
    return true;
  }

  if (m0 === undefined || m1 === undefined) {
    return false;
  }

  return m0.equals(m1);
}

export function isSameModel(model1: CadModelOptions, model2: CadModelOptions): boolean {
  return model1.modelId === model2.modelId && model1.revisionId === model2.revisionId;
}
