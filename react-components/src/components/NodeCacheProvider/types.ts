/*!
 * Copyright 2023 Cognite AS
 */
import { type Node3D } from '@cognite/sdk';
import { type EdgeItem, type DmsUniqueIdentifier, type Source } from '../../utilities/FdmSDK';
import { type InModel3dEdgeProperties } from '../../utilities/globalDataModels';

import { split } from 'lodash';

export type Fdm3dNodeData = { fdmId: DmsUniqueIdentifier; view: Source; cadNode: Node3D };
export type FdmCadEdge = EdgeItem<InModel3dEdgeProperties>;
export type FdmEdgeWithNode = { edge: FdmCadEdge; node: Node3D };

export type ModelId = number;
export type RevisionId = number;
export type TreeIndex = number;
export type NodeId = number;
export type FdmId = DmsUniqueIdentifier;

export type ModelRevisionId = { modelId: number; revisionId: number };

export type ModelRevisionKey = `${ModelId}/${RevisionId}`;
export type FdmKey = `${string}/${string}`;
export type ModelNodeIdKey = `${ModelId}/${RevisionId}/${NodeId}`;

export type ModelRevisionToEdgeMap = Map<ModelRevisionKey, FdmEdgeWithNode[]>;

export function createModelRevisionKey(modelId: number, revisionId: number): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}

export function revisionKeyToIds(revisionKey: ModelRevisionKey): [number, number] {
  const components = split(revisionKey, '/');
  return [Number(components[0]), Number(components[1])];
}

export function createModelNodeId(
  modelId: number,
  revisionId: number,
  nodeId: number
): ModelNodeIdKey {
  return `${modelId}/${revisionId}/${nodeId}`;
}

export function createFdmKey(spaceId: string, externalId: string): FdmKey {
  return `${spaceId}/${externalId}`;
}
