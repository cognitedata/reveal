/*!
 * Copyright 2022 Cognite AS
 */
import { CogniteClient, ListResponse, Node3D } from '@cognite/sdk';
import chunk from 'lodash/chunk';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { CdfNodeCollectionBase } from './CdfNodeCollectionBase';
import { NodeCollectionSerializationContext, registerNodeCollectionType } from './NodeCollectionDeserializer';
import { SerializedNodeCollection } from './SerializedNodeCollection';

/**
 * Collection that holds a set of nodes including children identified by nodeIds. Note that
 * this involves remapping IDs to "tree indices" and subtree sized used by Reveal using
 * the CDF API. Its often better to use one of the other node collections or {@see TreeIndexNodeCollection}
 * whenever possible for best performance.
 */
export class NodeIdNodeCollection extends CdfNodeCollectionBase {
  public static readonly classToken = 'NodeIdNodeCollection';

  private readonly _client: CogniteClient;
  private readonly _model: CdfModelNodeCollectionDataProvider;

  private _nodeIds: number[] = [];

  constructor(client: CogniteClient, model: CdfModelNodeCollectionDataProvider) {
    super(NodeIdNodeCollection.classToken, model);
    this._client = client;
    this._model = model;
  }

  /**
   * Populates the collection with the nodes with the IDs provided. All children of
   * the nodes are also included in the collection.
   * @param nodeIds IDs of nodes to include in the collection.
   * @returns Promise that resolves when the collection is populated.
   */
  async executeFilter(nodeIds: number[]): Promise<void> {
    this._nodeIds = [...nodeIds];

    if (nodeIds.length === 0) {
      return this.updateCollectionFromResults([]);
    }

    const { modelId, revisionId } = this._model;
    const executeRequest = async (batchNodeIds: number[]) => {
      const response = await this._client.revisions3D.retrieve3DNodes(
        modelId,
        revisionId,
        batchNodeIds.map(id => ({ id }))
      );
      const listResponse = new SingleRequestListResponse<Node3D[]>(response);
      return listResponse;
    };
    const responses = chunk(nodeIds, 1000).map(chunk => executeRequest(chunk));
    return this.updateCollectionFromResults(responses);
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: { nodeIds: this._nodeIds }
    };
  }

  static async deserialize(
    descriptor: SerializedNodeCollection,
    context: NodeCollectionSerializationContext
  ): Promise<NodeIdNodeCollection> {
    const { nodeIds }: { nodeIds: number[] } = descriptor.state;
    const collection = new NodeIdNodeCollection(context.client, context.model);
    await collection.executeFilter(nodeIds);
    return collection;
  }
}

// Register type for deserialization
registerNodeCollectionType<NodeIdNodeCollection>(NodeIdNodeCollection.classToken, (descriptor, context) =>
  NodeIdNodeCollection.deserialize(descriptor, context)
);

class SingleRequestListResponse<T> implements ListResponse<T> {
  constructor(items: T) {
    this.items = items;
  }

  readonly next: (() => Promise<ListResponse<T>>) | undefined = undefined;
  readonly nextCursor?: string | undefined = undefined;
  readonly items: T;
}
