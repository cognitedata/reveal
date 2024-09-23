/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type FdmCadConnection } from '../../components/CacheProvider/types';
import { type FdmSDK } from '../FdmSDK';
import {
  type InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE,
  SYSTEM_SPACE_3D_SCHEMA
} from './dataModels';
import { fdmEdgesToCadConnections } from './fdmEdgesToCadConnections';
import { type CogniteClient } from '@cognite/sdk/dist/src';

export async function getCadConnectionsForRevision(
  modelOptions: AddModelOptions[],
  fdmClient: FdmSDK,
  cogniteClient: CogniteClient
): Promise<FdmCadConnection[]> {
  if (modelOptions.length === 0) return [];

  const revisionIds = modelOptions.map((model) => model.revisionId);

  const versionedPropertiesKey = `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`;
  const filter = {
    in: {
      property: [SYSTEM_SPACE_3D_SCHEMA, versionedPropertiesKey, 'revisionId'],
      values: revisionIds
    }
  };
  const mappings = await fdmClient.filterAllInstances<InModel3dEdgeProperties>(
    filter,
    'edge',
    SYSTEM_3D_EDGE_SOURCE
  );
  return await fdmEdgesToCadConnections(mappings.instances, cogniteClient);
}
