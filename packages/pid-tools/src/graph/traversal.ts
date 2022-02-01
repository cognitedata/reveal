/* eslint-disable no-continue */
import { DiagramInstanceId, DiagramInstanceWithPaths } from '../types';
import { getDiagramInstanceId, getInstanceByDiagramInstanceId } from '../utils';

import { Graph } from './types';

export type Path = {
  to: DiagramInstanceId;
  from: DiagramInstanceId;
  path: DiagramInstanceWithPaths[];
};

// multi-source BFS
export const calculateShortestPaths = (
  startInstanceIds: DiagramInstanceId[],
  graph: Graph,
  relevantSymbolTypes: string[]
): Path[] => {
  const shortestPaths: Path[] = [];
  const visited: DiagramInstanceId[] = [];

  const queue = startInstanceIds.map((startInstanceId) => ({
    instanceId: startInstanceId,
    path: [] as DiagramInstanceWithPaths[],
  }));

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur === undefined) {
      continue;
    }
    const { instanceId } = cur;
    if (visited.includes(instanceId)) {
      continue;
    }
    visited.push(instanceId);

    const diagramInstance: DiagramInstanceWithPaths =
      getInstanceByDiagramInstanceId(
        [...graph.diagramLineInstances, ...graph.diagramSymbolInstances],
        instanceId
      )! as DiagramInstanceWithPaths;

    if (
      diagramInstance.type !== undefined &&
      relevantSymbolTypes.includes(diagramInstance.type)
    ) {
      const path = [...cur.path, diagramInstance];
      shortestPaths.push({
        from: getDiagramInstanceId(path[0]),
        to: instanceId,
        path,
      });
    }

    const neighbours: DiagramInstanceId[] = graph.diagramConnections
      .filter((con) => con.end === instanceId || con.start === instanceId)
      .map((con) => (con.start === instanceId ? con.end : con.start));

    for (let i = 0; i < neighbours.length; i++) {
      queue.push({
        instanceId: neighbours[i],
        path: [...cur.path, diagramInstance],
      });
    }
  }

  return shortestPaths;
};
