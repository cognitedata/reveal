/* eslint-disable no-continue */
import {
  DiagramConnection,
  DiagramInstanceId,
  DiagramInstanceWithPaths,
} from '../types';
import { getDiagramInstanceId, getInstanceByDiagramInstanceId } from '../utils';

import { Graph } from './types';

const getNeighbours = (
  instanceId: DiagramInstanceId,
  connections: DiagramConnection[]
): DiagramInstanceId[] => {
  return connections
    .filter((con) => con.end === instanceId || con.start === instanceId)
    .map((con) => (con.start === instanceId ? con.end : con.start));
};

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

    const neighbours: DiagramInstanceId[] = getNeighbours(
      instanceId,
      graph.diagramConnections
    );

    for (let i = 0; i < neighbours.length; i++) {
      queue.push({
        instanceId: neighbours[i],
        path: [...cur.path, diagramInstance],
      });
    }
  }

  return shortestPaths;
};

export interface TraverseProps {
  startInstance: DiagramInstanceWithPaths;
  graph: Graph;
  processInstance: (instance: DiagramInstanceWithPaths) => void;
  addNeighbour: (
    instance: DiagramInstanceWithPaths,
    potNeighbour: DiagramInstanceWithPaths
  ) => boolean;
}

export const traverse = ({
  startInstance,
  graph,
  processInstance,
  addNeighbour,
}: TraverseProps) => {
  const visited: DiagramInstanceId[] = [];
  const queue: DiagramInstanceWithPaths[] = [startInstance];

  const instancesMap = new Map<DiagramInstanceId, DiagramInstanceWithPaths>();
  [...graph.diagramLineInstances, ...graph.diagramSymbolInstances].forEach(
    (instance) => {
      instancesMap.set(getDiagramInstanceId(instance), instance);
    }
  );

  while (queue.length > 0) {
    const diagramInstance = queue.shift();

    if (diagramInstance === undefined) continue;

    const instanceId = getDiagramInstanceId(diagramInstance);
    processInstance(diagramInstance);

    if (visited.includes(instanceId)) continue;

    visited.push(instanceId);

    const neighbours: DiagramInstanceId[] = getNeighbours(
      instanceId,
      graph.diagramConnections
    );

    for (let i = 0; i < neighbours.length; i++) {
      const newDiagramInstnace = instancesMap.get(neighbours[i])!;

      if (addNeighbour(diagramInstance, newDiagramInstnace)) {
        queue.push(newDiagramInstnace);
      }
    }
  }
};
