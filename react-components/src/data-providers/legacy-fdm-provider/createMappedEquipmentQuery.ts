/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import {
  makeSureNonEmptyFilterForRequest,
  type InstanceFilter,
  type Query,
  type Source
} from '../FdmSDK';
import { SYSTEM_3D_EDGE_SOURCE } from './dataModels';

export function createMappedEquipmentQuery(
  models: AddModelOptions[],
  views: Source[],
  instanceFilter: InstanceFilter | undefined,
  limit: number = 10000,
  cursors?: Record<string, string>
): Query {
  instanceFilter = makeSureNonEmptyFilterForRequest(instanceFilter);

  return {
    with: {
      mapped_edges: {
        edges: {
          filter: createInModelsFilter(models)
        },
        limit
      },
      mapped_nodes: {
        nodes: {
          from: 'mapped_edges',
          chainTo: 'source',
          filter: instanceFilter
        },
        limit
      },
      mapped_edges_2: {
        edges: {
          from: 'mapped_nodes',
          direction: 'inwards',
          maxDistance: 1
        }
      },
      mapped_nodes_2: {
        nodes: {
          from: 'mapped_edges_2',
          chainTo: 'destination',
          filter: instanceFilter
        }
      }
    },
    cursors,
    select: {
      mapped_nodes_2: {
        sources: views.map((view) => ({ source: view, properties: [] }))
      },
      mapped_edges_2: {},
      mapped_edges: {
        sources: [{ source: SYSTEM_3D_EDGE_SOURCE, properties: [] }]
      },
      mapped_nodes: {
        sources: views.map((view) => ({ source: view, properties: [] }))
      }
    }
  };
}

function createInModelsFilter(models: AddModelOptions[]): { in: any } {
  return {
    in: {
      property: [
        SYSTEM_3D_EDGE_SOURCE.space,
        `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`,
        'revisionId'
      ],
      values: models.map((model) => model.revisionId)
    }
  };
}
