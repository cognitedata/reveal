import { FdmCadConnection } from '../../components/CacheProvider/types';
import { EdgeItem } from '../FdmSDK';
import { InModel3dEdgeProperties } from './dataModels';

export function fdmEdgesToCadConnections(
  edges: Array<EdgeItem<InModel3dEdgeProperties>>
): FdmCadConnection[] {
  return edges.map((instance) => ({
    nodeId: instance.properties.revisionNodeId,
    revisionId: instance.properties.revisionId,
    modelId: Number(instance.endNode.externalId),
    instance: instance.startNode
  }));
}
