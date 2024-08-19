/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import {
  type FdmSDK,
  type InstanceFilter,
  type NodeItem,
  type Query,
  type Source
} from '../FdmSDK';
import { createMappedEquipmentQuery } from './createMappedEquipmentQuery';
import { chunk, isEqual } from 'lodash';
import { removeEmptyProperties } from '../../utilities/removeEmptyProperties';
import { QueryRequest } from '@cognite/sdk/dist/src';

export async function listMappedFdmNodes(
  fdmSdk: FdmSDK,
  models: AddModelOptions[],
  sourcesToSearch: Source[],
  instanceFilter: InstanceFilter | undefined,
  limit: number
): Promise<NodeItem[]> {
  const result = await fdmSdk.queryNodesAndEdges(
    createMappedEquipmentQuery(models, sourcesToSearch, instanceFilter, limit)
  );

  return result.items.mapped_nodes.concat(result.items.mapped_nodes_2) as NodeItem[];
}

export async function listAllMappedFdmNodes(
  fdmSdk: FdmSDK,
  models: AddModelOptions[],
  sourcesToSearch: Source[]
): Promise<NodeItem[]> {
  const queries = createChunkedMappedEquipmentQueries(models, sourcesToSearch, 10000);

  const mappedEquipment: NodeItem[] = [];
  for (const query of queries) {
    let currentPage = await fdmSdk.queryNodesAndEdges(query);

    const mappedNodes = currentPage.items.mapped_nodes as NodeItem[];
    const mappedNodesParents = currentPage.items.mapped_nodes_2 as NodeItem[];
    mappedEquipment.push(
      ...mappedNodes.concat(mappedNodesParents).map((node) => removeEmptyProperties(node))
    );

    while (!isEqual(currentPage.nextCursor, {})) {
      query.cursors = currentPage.nextCursor;

      currentPage = await fdmSdk.queryNodesAndEdges(query);

      const cleanedNodes = currentPage.items.mapped_nodes.map((node) =>
        removeEmptyProperties(node as NodeItem)
      );
      const cleanedNodesParents = currentPage.items.mapped_nodes_2.map((node) =>
        removeEmptyProperties(node as NodeItem)
      );

      mappedEquipment.push(...cleanedNodes.concat(cleanedNodesParents));
    }
  }

  return mappedEquipment;
}

function createChunkedMappedEquipmentQueries(
  models: AddModelOptions[],
  views: Source[],
  limit: number = 10000,
  cursors?: Record<string, string>
): QueryRequest[] {
  const viewChunks = chunk(views, 10);
  return viewChunks.map((viewChunk) =>
    createMappedEquipmentQuery(models, viewChunk, undefined, limit, cursors)
  );
}
