/*!
 * Copyright 2020 Cognite AS
 */

import { Subject } from 'rxjs';
import { bufferTime, flatMap, filter } from 'rxjs/operators';
import { CogniteClient, InternalId, Node3D } from '@cognite/sdk';

interface NodeIdRequest {
  nodeId: InternalId;
  onComplete: (treeIndex: number) => void;
}

interface NodeIdResponse {
  requests: NodeIdRequest[];
  responses: Node3D[];
}

export class NodeIdAndTreeIndexMaps {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly nodeIdRequestObservable: Subject<NodeIdRequest>;
  constructor(modelId: number, revisionId: number, client: CogniteClient) {
    this.nodeIdToTreeIndexMap = new Map();
    this.nodeIdRequestObservable = new Subject<NodeIdRequest>();
    this.nodeIdRequestObservable
      .pipe(
        bufferTime(50),
        filter((requests: NodeIdRequest[]) => requests.length > 0),
        flatMap(async (requests: NodeIdRequest[]) => {
          const responses = await client.revisions3D.retrieve3DNodes(
            modelId,
            revisionId,
            Array.from(requests.map(request => request.nodeId))
          );
          return {
            requests,
            responses
          };
        })
      )
      .subscribe((response: NodeIdResponse) => {
        response.responses.forEach((node, index) => {
          this.nodeIdToTreeIndexMap.set(node.id, node.treeIndex);
          if (response.requests[index]) {
            response.requests[index].onComplete(node.treeIndex);
          }
        });
      });
  }

  async getTreeIndex(nodeId: number) {
    const treeIndex = this.nodeIdToTreeIndexMap.get(nodeId);
    if (treeIndex) {
      return treeIndex;
    }
    return new Promise((resolve: (treeIndex: number) => void) => {
      this.nodeIdRequestObservable.next({
        nodeId: {
          id: nodeId
        },
        onComplete: resolve
      });
    });
  }
}
