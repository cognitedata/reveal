/*!
 * Copyright 2023 Cognite AS
 */
import { type Node3D } from '@cognite/sdk';
import { type EdgeItem, type DmsUniqueIdentifier, type Source } from '../../utilities/FdmSDK';
import { type InModel3dEdgeProperties } from '../../utilities/globalDataModels';

export type Fdm3dNodeData = { fdmId: DmsUniqueIdentifier; view: Source; cadNode: Node3D };
export type FdmCadEdge = EdgeItem<InModel3dEdgeProperties>;
export type FdmEdgeWithNode = { edge: FdmCadEdge; node: Node3D };
