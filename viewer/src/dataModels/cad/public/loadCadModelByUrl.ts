/*!
 * Copyright 2020 Cognite AS
 */

import { CadModel } from './CadModel';
import { CadModelImpl } from '../internal/CadModelImpl';
import { ByUrlModelDataRetriever } from '@/utilities/networking/ByUrlModelDataRetriever';
import { SectorModelTransformation } from '../internal/sector/types';
import {
  DefaultSectorRotationMatrix,
  DefaultInverseSectorRotationMatrix
} from '@/utilities/constructMatrixFromRotation';

/**
 * Create a new CAD model by using the URL provided. This is useful for loading CAD models outside of
 * CDF, typically when testing.
 *
 * @param baseUrl Base URL of the CAD model.
 */
export async function loadCadModelByUrl(baseUrl: string): Promise<CadModel> {
  const retriever = new ByUrlModelDataRetriever(baseUrl);
  const transform: SectorModelTransformation = {
    modelMatrix: DefaultSectorRotationMatrix,
    inverseModelMatrix: DefaultInverseSectorRotationMatrix
  };
  const model = await CadModelImpl.create(baseUrl, retriever, transform);
  return model;
}
