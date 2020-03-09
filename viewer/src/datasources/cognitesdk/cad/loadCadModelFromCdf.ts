/*!
 * Copyright 2020 Cognite AS
 */

import { CadModel } from '../../../models/cad/CadModel';
import { CogniteClient } from '@cognite/sdk';
import {
  CogniteClient3dExtensions,
  CogniteUniformId,
  CogniteWellknown3dFormat
} from '../../../utils/CogniteClient3dExtensions';
import { CdfModelDataRetriever } from '../CdfModelDataRetriever';
import { CadModelImpl } from '../../../models/cad/CadModelImpl';
import { SectorModelTransformation } from '../../../models/cad/types';
import { DefaultSectorRotationMatrix, DefaultInverseSectorRotationMatrix } from '../../constructMatrixFromRotation';

const SupportedCadVersions = [8];

export async function loadCadModelFromCdf(client: CogniteClient, modelRevisionId: CogniteUniformId): Promise<CadModel> {
  const extension = new CogniteClient3dExtensions(client);
  const outputs = await extension.getOutputs(modelRevisionId, [CogniteWellknown3dFormat.RevealCadModel]);
  if (!outputs) {
    throw new Error(`Model is not compatible with Reveal`);
  }
  const output = outputs.findMostRecentOutput(CogniteWellknown3dFormat.RevealCadModel, SupportedCadVersions);
  if (!output) {
    throw new Error('Model has no compatible output versions');
  }

  // TODO 2020-03-02 larsmoa: Load model transform from CDF. Somehow.
  const transform: SectorModelTransformation = {
    modelMatrix: DefaultSectorRotationMatrix,
    inverseModelMatrix: DefaultInverseSectorRotationMatrix
  };
  const retriever = new CdfModelDataRetriever(client, output.blobId);
  const model = await CadModelImpl.create(retriever, transform);
  return model;
}
