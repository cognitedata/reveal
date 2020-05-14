/*!
 * Copyright 2020 Cognite AS
 */

import { CadModel } from './CadModel';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { CogniteClient3dExtensions } from '../../../utils/CogniteClient3dExtensions';
import { CdfModelDataRetriever } from '../../../datasources/cognitesdk/CdfModelDataRetriever';
import { CadModelImpl } from '../internal/CadModelImpl';
import { SectorModelTransformation } from '../../../models/cad/types';
import {
  DefaultSectorRotationMatrix,
  DefaultInverseSectorRotationMatrix
} from '../../../datasources/constructMatrixFromRotation';
import { File3dFormat } from '../../../data/model/File3dFormat';
import { instanceOfExternalId, instanceOfInternalId } from '../../../data/utils/cogniteSdkGuards';

const SupportedCadVersions = [8];

export async function loadCadModelFromCdf(client: CogniteClient, modelRevisionId: IdEither): Promise<CadModel> {
  const extension = new CogniteClient3dExtensions(client);
  const outputs = await extension.getOutputs(modelRevisionId, [File3dFormat.RevealCadModel]);
  if (!outputs) {
    throw new Error(`Model is not compatible with Reveal`);
  }
  const output = outputs.findMostRecentOutput(File3dFormat.RevealCadModel, SupportedCadVersions);
  if (!output) {
    throw new Error('Model has no compatible output versions');
  }

  // TODO 2020-03-02 larsmoa: Load model transform from CDF. Somehow.
  const transform: SectorModelTransformation = {
    modelMatrix: DefaultSectorRotationMatrix,
    inverseModelMatrix: DefaultInverseSectorRotationMatrix
  };

  let identifier: string | undefined;
  if (instanceOfExternalId(modelRevisionId)) {
    identifier = modelRevisionId.externalId;
  }
  if (instanceOfInternalId(modelRevisionId)) {
    identifier = '' + modelRevisionId.id;
  }
  if (identifier === undefined) {
    throw new Error('Unknown identifier');
  }
  const retriever = new CdfModelDataRetriever(client, output.blobId);
  const model = await CadModelImpl.create(identifier, retriever, transform);
  return model;
}
