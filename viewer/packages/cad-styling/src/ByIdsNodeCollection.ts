/*!
 * Copyright 2022 Cognite AS
 */
import { CogniteClient, ListResponse, Node3D } from '@cognite/sdk';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { CdfNodeCollectionBase } from './CdfNodeCollectionBase';
import { NodeCollectionSerializationContext, registerNodeCollectionType } from './NodeCollectionDeserializer';
import { SerializedNodeCollection } from './SerializedNodeCollection';

/**
 * Collection that holds a set of nodes including children identified by nodeIds.
 */
export class ByIdsNodeCollection extends CdfNodeCollectionBase {
  public static readonly classToken = 'ByIdsNodeCollection';

  private readonly _client: CogniteClient;
  private readonly _model: CdfModelNodeCollectionDataProvider;

  private _nodeIds: number[] = [];

  constructor(client: CogniteClient, model: CdfModelNodeCollectionDataProvider) {
    super(ByIdsNodeCollection.classToken, model);
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
      throw new Error(`${ByIdsNodeCollection.name} supports maximum 1000 nodeIds, but got ${nodeIds.length}`);
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
  ): Promise<ByIdsNodeCollection> {
    const { nodeIds }: { nodeIds: number[] } = descriptor.state;
    const collection = new ByIdsNodeCollection(context.client, context.model);
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
registerNodeCollectionType<ByIdsNodeCollection>(ByIdsNodeCollection.classToken, (descriptor, context) =>
  ByIdsNodeCollection.deserialize(descriptor, context)
);
