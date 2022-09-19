/*!
 * Copyright 2021 Cognite AS
 */

import assert from 'assert';
import { CogniteClient } from '@cognite/sdk';
import { NumericRange, IndexSet } from '@reveal/utilities';

import { AssetNodeCollection } from './AssetNodeCollection';
import { PropertyFilterNodeCollection } from './PropertyFilterNodeCollection';
import { InvertedNodeCollection } from './InvertedNodeCollection';
import { SinglePropertyFilterNodeCollection } from './SinglePropertyFilterNodeCollection';

import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { TreeIndexNodeCollection } from './TreeIndexNodeCollection';
import { IntersectionNodeCollection } from './IntersectionNodeCollection';
import { UnionNodeCollection } from './UnionNodeCollection';
import { NodeCollection } from './NodeCollection';
import { SerializedNodeCollection } from './SerializedNodeCollection';

export type NodeCollectionSerializationContext = { client: CogniteClient; model: CdfModelNodeCollectionDataProvider };

export class NodeCollectionDeserializer {
  public static readonly Instance = new NodeCollectionDeserializer();
  private readonly _types = new Map<
    string,
    {
      deserializer: (
        state: SerializedNodeCollection,
        context: NodeCollectionSerializationContext
      ) => Promise<NodeCollection>;
    }
  >();

  private constructor() {
    this._types = new Map();
    this.registerWellKnownNodeCollectionTypes();
  }

  registerNodeCollectionType<T extends NodeCollection>(
    nodeCollectionTypeName: string,
    deserializer: (descriptor: SerializedNodeCollection, context: NodeCollectionSerializationContext) => Promise<T>
  ): void {
    this._types.set(nodeCollectionTypeName, {
      deserializer: (descriptor: SerializedNodeCollection, context: NodeCollectionSerializationContext) =>
        deserializer(descriptor, context) as Promise<T>
    });
  }

  async deserialize(
    // TODO 2021-10-01 larsmoa: Avoid forcing node collections to rely on CogniteClient
    // to support more generic deployment scenarios.
    client: CogniteClient,
    model: CdfModelNodeCollectionDataProvider,
    descriptor: SerializedNodeCollection
  ): Promise<NodeCollection> {
    const context: NodeCollectionSerializationContext = { client, model };
    const deserializer = this.getDeserializer(descriptor.token);
    return deserializer(descriptor, context);
  }

  private getDeserializer(typeName: string) {
    const entry = this._types.get(typeName);
    assert(entry !== undefined);
    return entry!.deserializer;
  }

  private registerWellKnownNodeCollectionTypes() {
    this.registerNodeCollectionType<AssetNodeCollection>(
      AssetNodeCollection.classToken,
      async (descriptor, context) => {
        const nodeCollection = new AssetNodeCollection(context.client, context.model);
        await nodeCollection.executeFilter(descriptor.state);
        return nodeCollection;
      }
    );

    this.registerNodeCollectionType<PropertyFilterNodeCollection>(
      PropertyFilterNodeCollection.classToken,
      async (descriptor, context) => {
        const nodeCollection = new PropertyFilterNodeCollection(context.client, context.model, descriptor.options);
        await nodeCollection.executeFilter(descriptor.state);
        return nodeCollection;
      }
    );

    this.registerNodeCollectionType<SinglePropertyFilterNodeCollection>(
      SinglePropertyFilterNodeCollection.classToken,
      async (descriptor, context) => {
        const nodeCollection = new SinglePropertyFilterNodeCollection(
          context.client,
          context.model,
          descriptor.options
        );
        const { propertyCategory, propertyKey, propertyValues } = descriptor.state;
        await nodeCollection.executeFilter(propertyCategory, propertyKey, propertyValues);
        return nodeCollection;
      }
    );

    this.registerNodeCollectionType<TreeIndexNodeCollection>(TreeIndexNodeCollection.classToken, descriptor => {
      const indexSet = new IndexSet();
      descriptor.state.forEach((range: NumericRange) => indexSet.addRange(new NumericRange(range.from, range.count)));
      const nodeCollection = new TreeIndexNodeCollection(indexSet);
      if (descriptor.options?.areas !== undefined) {
        nodeCollection.addAreas(descriptor.options.areas);
      }

      return Promise.resolve(nodeCollection);
    });

    this.registerNodeCollectionType<IntersectionNodeCollection>(
      IntersectionNodeCollection.classToken,
      async (descriptor, context) => {
        const subCollections: NodeCollection[] = await Promise.all(
          descriptor.state.subCollections.map((subSet: any) => {
            return this.deserialize(context.client, context.model, subSet);
          })
        );
        return new IntersectionNodeCollection(subCollections);
      }
    );

    this.registerNodeCollectionType<UnionNodeCollection>(
      UnionNodeCollection.classToken,
      async (descriptor, context) => {
        const subCollections: NodeCollection[] = await Promise.all(
          descriptor.state.subCollections.map((subSet: any) => {
            return this.deserialize(context.client, context.model, subSet);
          })
        );
        return new UnionNodeCollection(subCollections);
      }
    );

    this.registerNodeCollectionType<InvertedNodeCollection>(
      InvertedNodeCollection.classToken,
      async (descriptor, context) => {
        const innerCollection = await this.deserialize(context.client, context.model, descriptor.state.innerSet);
        return new InvertedNodeCollection(context.model, innerCollection);
      }
    );
  }
}

export function registerNodeCollectionType<T extends NodeCollection>(
  nodeCollectionTypeName: string,
  deserializer: (descriptor: SerializedNodeCollection, context: NodeCollectionSerializationContext) => Promise<T>
): void {
  NodeCollectionDeserializer.Instance.registerNodeCollectionType(nodeCollectionTypeName, deserializer);
}
