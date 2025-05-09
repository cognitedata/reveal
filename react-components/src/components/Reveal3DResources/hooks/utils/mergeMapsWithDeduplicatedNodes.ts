/*!
 * Copyright 2025 Cognite AS
 */
import { type Node3D } from '@cognite/sdk';
import { type NodeId } from '../../../CacheProvider/types';

export function mergeMapsWithDeduplicatedNodes(
  targetMap: Map<string, Map<NodeId, Node3D>>,
  addedMap: Map<string, Node3D[]>
): Map<string, Map<NodeId, Node3D>> {
  return [...addedMap.entries()].reduce((map, [dmKey, nodesToAdd]) => {
    const targetSet = map.get(dmKey);

    if (targetSet !== undefined) {
      nodesToAdd.forEach((node) => targetSet.set(node.id, node));
    } else {
      map.set(dmKey, new Map(nodesToAdd.map((node) => [node.id, node])));
    }

    return map;
  }, targetMap);
}
