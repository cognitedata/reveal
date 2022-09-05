/* eslint-disable no-continue */
import {
  DiagramConnection,
  DiagramInstance,
  DiagramInstanceId,
  DiagramInstanceOutputFormat,
} from '../types';

import { GraphOutputFormat } from './types';

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
  const visited = new Set<DiagramInstanceId>();

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
    if (visited.has(instanceId)) {
      continue;
    }
    visited.add(instanceId);

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

export interface IGraph {
  instances: DiagramInstance[];
  connections: DiagramConnection[];
}

export const breadthFirstTraversal = ({
  startInstance,
  graph,
  processInstance,
  addNeighbour,
}: {
  startInstance: DiagramInstance;
  graph: IGraph;
  processInstance: (instance: DiagramInstance, path: DiagramInstance[]) => void;
  addNeighbour: (
    // wheter or not to add `potNeighbour` to the queue
    instance: DiagramInstance,
    potNeighbour: DiagramInstance,
    path: DiagramInstance[] // not including `potNeighbour`
  ) => boolean;
}) => {
  const visited = new Set<DiagramInstanceId>();
  const queue: { diagramInstance: DiagramInstance; path: DiagramInstance[] }[] =
    [{ diagramInstance: startInstance, path: [startInstance] }];

  const instancesMap = new Map<DiagramInstanceId, DiagramInstance>();
  graph.instances.forEach((instance) => {
    instancesMap.set(instance.id, instance);
  });

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) continue;

    const { diagramInstance, path } = current;

    const instanceId = diagramInstance.id;
    if (visited.has(instanceId)) continue;

    processInstance(diagramInstance, path);

    visited.add(instanceId);

    const neighbourIds: DiagramInstanceId[] = getNeighbours(
      instanceId,
      graph.connections
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const potNeighbourId of neighbourIds) {
      const potNeighbour = instancesMap.get(potNeighbourId)!;

      if (addNeighbour(diagramInstance, potNeighbour, path)) {
        queue.push({
          diagramInstance: potNeighbour,
          path: [...path, potNeighbour],
        });
      }
    }
  }
};

export const calculateShortestPath = ({
  from,
  to,
  graph,
}: {
  from: DiagramInstanceId;
  to: DiagramInstanceId;
  graph: IGraph;
}): DiagramInstance[] | undefined => {
  const startInstance = graph.instances.find(
    (instance) => instance.id === from
  );
  if (startInstance === undefined) return undefined;

  let shortestPath: DiagramInstance[] | undefined;

  breadthFirstTraversal({
    startInstance,
    graph,
    processInstance: (instance, path) => {
      if (instance.id === to && shortestPath === undefined) {
        shortestPath = path;
      }
    },
    addNeighbour: () => shortestPath === undefined,
  });

  return shortestPath;
};
