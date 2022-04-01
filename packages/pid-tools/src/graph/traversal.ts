/* eslint-disable no-continue */
import {
  DiagramConnection,
  DiagramInstanceId,
  DiagramInstanceOutputFormat,
  DiagramInstanceWithPaths,
} from '../types';
import { getDiagramInstanceId } from '../utils';

import { Graph, GraphOutputFormat } from './types';

const getNeighbours = (
  instanceId: DiagramInstanceId,
  connections: DiagramConnection[]
): DiagramInstanceId[] => {
  return connections
    .filter((con) => con.end === instanceId || con.start === instanceId)
    .map((con) => (con.start === instanceId ? con.end : con.start));
};

export type PathOutputFormat = {
  to: DiagramInstanceId;
  from: DiagramInstanceId;
  path: DiagramInstanceOutputFormat[];
};

// multi-source BFS
export const calculateShortestPaths = (
  startInstanceIds: DiagramInstanceId[],
  graph: GraphOutputFormat,
  relevantSymbolTypes: string[]
): PathOutputFormat[] => {
  const shortestPaths: PathOutputFormat[] = [];
  const visited: DiagramInstanceId[] = [];

  const queue = startInstanceIds.map((startInstanceId) => ({
    instanceId: startInstanceId,
    path: <DiagramInstanceOutputFormat[]>[],
  }));

  const instanceIdMap = new Map<string, DiagramInstanceOutputFormat>();
  [...graph.diagramLineInstances, ...graph.diagramSymbolInstances].forEach(
    (instance) => {
      instanceIdMap.set(instance.id, instance);
    }
  );

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

    const diagramInstance = instanceIdMap.get(instanceId);
    if (diagramInstance === undefined) {
      // eslint-disable-next-line no-console
      console.warn(`GRAPH: Unable to find instance with id: ${instanceId}`);
      continue;
    }

    const isRelevantType = relevantSymbolTypes.includes(diagramInstance.type);
    const path = isRelevantType ? [...cur.path, diagramInstance] : cur.path;

    if (isRelevantType) {
      shortestPaths.push({
        from: path[0].id,
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
        path,
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
