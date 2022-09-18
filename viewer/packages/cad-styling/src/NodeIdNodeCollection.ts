/*!
 * Copyright 2022 Cognite AS
 */
import { CogniteClient, ListResponse, Node3D } from '@cognite/sdk';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { CdfNodeCollectionBase } from './CdfNodeCollectionBase';
import { NodeCollectionSerializationContext, registerNodeCollectionType } from './NodeCollectionDeserializer';
import { SerializedNodeCollection } from './SerializedNodeCollection';

/**
 * Collection that holds a set of nodes including children identified by nodeIds. Note that
 * this involves remapping IDs to "tree indices" and subtree sized used by Reveal using
 * the CDF API. Its often better to use one of the other node collections or {@see TreeIndexNodeCollection}
 * whenever possible for best performance.
 *
 * Note that the collection supports maximum 1000 nodes for remapping (excluding children).
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
   * @param nodeIds IDs of nodes to include in the collection. Up to 1000 IDs.
   * @returns Promise that resolves when the collection is populated.
   */
  async executeFilter(nodeIds: number[]): Promise<void> {
    if (nodeIds.length > 1000) {
      throw new Error(`${NodeIdNodeCollection.name} supports maximum 1000 nodeIds, but got ${nodeIds.length}`);
    }
    this._nodeIds = [...nodeIds];

    if (nodeIds.length === 0) {
      return this.updateCollectionFromResults([]);
    }

    const { modelId, revisionId } = this._model;
    const executeRequest = async () => {
      const response = await this._client.revisions3D.retrieve3DNodes(
        modelId,
        revisionId,
        nodeIds.map(id => ({ id }))
      );
      const listResponse = new SingleRequestListResponse<Node3D[]>(response);
      return listResponse;
    };
    const responses = [executeRequest()];
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

class SingleRequestListResponse<T> implements ListResponse<T> {
  constructor(items: T) {
    this.items = items;
  }

  readonly next: (() => Promise<ListResponse<T>>) | undefined = undefined;
  readonly nextCursor?: string | undefined = undefined;
  readonly items: T;
}

// Register type for deserialization
registerNodeCollectionType<NodeIdNodeCollection>(NodeIdNodeCollection.classToken, (descriptor, context) =>
  NodeIdNodeCollection.deserialize(descriptor, context)
);
