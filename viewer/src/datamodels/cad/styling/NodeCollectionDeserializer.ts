/*!
 * Copyright 2021 Cognite AS
 */

import assert from 'assert';
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DModel } from '../../../migration';
import { IndexSet } from '../../../utilities/IndexSet';
import { NumericRange } from '../../../utilities/NumericRange';
import { NodeCollectionBase } from './NodeCollectionBase';
import { AssetNodeCollection } from './AssetNodeCollection';
import { PropertyFilterNodeCollection } from './PropertyFilterNodeCollection';
import { SimpleNodeCollection } from './SimpleNodeCollection';
import { CombineNodeCollectionBase } from './CombineNodeCollectionBase';
import { InvertedNodeCollection } from './InvertedNodeCollection';

export type TypeName = string;
export type NodeCollectionSerializationContext = { client: CogniteClient; model: Cognite3DModel };
export type NodeCollectionDescriptor = { token: TypeName; state: any; options?: any };

export class NodeCollectionDeserializer {
  public static readonly Instance = new NodeCollectionDeserializer();
  private readonly _types = new Map<
    TypeName,
    {
      deserializer: (
        state: NodeCollectionDescriptor,
        context: NodeCollectionSerializationContext
      ) => Promise<NodeCollectionBase>;
    }
  >();

  private constructor() {
    this._types = new Map();
    this.registerWellKnownNodeCollectionTypes();
  }

  registerNodeCollectionType<T extends NodeCollectionBase>(
    nodeCollectionType: TypeName,
    deserializer: (descriptor: NodeCollectionDescriptor, context: NodeCollectionSerializationContext) => Promise<T>
  ) {
    this._types.set(nodeCollectionType, {
      deserializer: (descriptor: NodeCollectionDescriptor, context: NodeCollectionSerializationContext) =>
        deserializer(descriptor, context) as Promise<T>
    });
  }

  async deserialize(
    client: CogniteClient,
    model: Cognite3DModel,
    descriptor: NodeCollectionDescriptor
  ): Promise<NodeCollectionBase> {
    const context: NodeCollectionSerializationContext = { client, model };
    const deserializer = this.getDeserializer(descriptor.token);
    return deserializer(descriptor, context);
  }

  private getDeserializer(typeName: TypeName) {
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

    this.registerNodeCollectionType<SimpleNodeCollection>(SimpleNodeCollection.classToken, descriptor => {
      const indexSet = new IndexSet();
      descriptor.state.forEach((range: NumericRange) => indexSet.addRange(new NumericRange(range.from, range.count)));
      const nodeCollection = new SimpleNodeCollection(indexSet);
      return Promise.resolve(nodeCollection);
    });

    this.registerNodeCollectionType<CombineNodeCollectionBase>(
      CombineNodeCollectionBase.classToken,
      async (descriptor, context) => {
        const subCollections: NodeCollectionBase[] = await Promise.all(
          descriptor.state.subCollections.map((subSet: any) => {
            return this.deserialize(context.client, context.model, subSet);
          })
        );
        return new CombineNodeCollectionBase(descriptor.state.operator, subCollections);
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

export function registerCustomNodeCollectionType<T extends NodeCollectionBase>(
  nodeCollectionType: TypeName,
  deserializer: (descriptor: NodeCollectionDescriptor, context: NodeCollectionSerializationContext) => Promise<T>
) {
  NodeCollectionDeserializer.Instance.registerNodeCollectionType(nodeCollectionType, deserializer);
}
