/*!
 * Copyright 2020 Cognite AS
 */

import { CadModel } from '../../../models/cad/CadModel';
import { CadModelImpl } from '../../../models/cad/CadModelImpl';
import { ByUrlModelDataRetriever } from '../ByUrlModelDataRetriever';
import { SectorModelTransformation } from '../../../models/cad/types';
import { DefaultSectorRotationMatrix, DefaultInverseSectorRotationMatrix } from '../../constructMatrixFromRotation';

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
  const model = new CadModelImpl(retriever, transform);
  await model.initialize();
  return model;
}
