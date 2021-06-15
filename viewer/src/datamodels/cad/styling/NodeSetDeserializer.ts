/*!
 * Copyright 2021 Cognite AS
 */

import assert from 'assert';
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DModel } from '../../../migration';
import {
  NodeSet,
  ByAssetNodeSet,
  ByNodePropertyNodeSet,
  ByTreeIndexNodeSet,
  CombinedNodeSet,
  InvertedNodeSet
} from '.';
import { IndexSet } from '../../../utilities/IndexSet';
import { NumericRange } from '../../../utilities/NumericRange';

type TypeName = string;
type NodeSetContext = { client: CogniteClient; model: Cognite3DModel };
type NodeSetDescriptor = { token: TypeName; state: any; options?: any };

export class NodeSetDeserializer {
  public static readonly Instance = new NodeSetDeserializer();
  private readonly _types = new Map<
    TypeName,
    {
      deserializer: (state: NodeSetDescriptor, context: NodeSetContext) => Promise<NodeSet>;
    }
  >();

  private constructor() {
    this._types = new Map();
    this.registerWellKnownNodeSetTypes();
  }
  registerNodeSetType<T extends NodeSet>(
    nodeSetType: TypeName,
    deserializer: (descriptor: NodeSetDescriptor, context: NodeSetContext) => Promise<T>
  ) {
    this._types.set(nodeSetType, {
      deserializer: (descriptor: NodeSetDescriptor, context: NodeSetContext) =>
        deserializer(descriptor, context) as Promise<T>
    });
  }

  async deserialize(client: CogniteClient, model: Cognite3DModel, descriptor: NodeSetDescriptor): Promise<NodeSet> {
    const context: NodeSetContext = { client, model };
    const deserializer = this.getDeserializer(descriptor.token);
    return deserializer(descriptor, context);
  }

  private getDeserializer(typeName: TypeName) {
    const entry = this._types.get(typeName);
    assert(entry !== undefined);
    return entry!.deserializer;
  }
  private registerWellKnownNodeSetTypes() {
    this.registerNodeSetType<ByAssetNodeSet>('ByAssetNodeSet', async (descriptor, context) => {
      const nodeSet = new ByAssetNodeSet(context.client, context.model);
      await nodeSet.executeFilter(descriptor.state);
      return nodeSet;
    });

    this.registerNodeSetType<ByNodePropertyNodeSet>('ByNodePropertyNodeSet', async (descriptor, context) => {
      const nodeSet = new ByNodePropertyNodeSet(context.client, context.model, descriptor.options);
      await nodeSet.executeFilter(descriptor.state);
      return nodeSet;
    });

    this.registerNodeSetType<ByTreeIndexNodeSet>('ByTreeIndexNodeSet', descriptor => {
      const indexSet = new IndexSet();
      descriptor.state.forEach((range: NumericRange) => indexSet.addRange(new NumericRange(range.from, range.count)));
      const nodeSet = new ByTreeIndexNodeSet(indexSet);
      return Promise.resolve(nodeSet);
    });

    this.registerNodeSetType<CombinedNodeSet>('CombinedNodeSet', async (descriptor, context) => {
      const subSets: NodeSet[] = await Promise.all(
        descriptor.state.subSets.map((subSet: any) => {
          return this.deserialize(context.client, context.model, subSet);
        })
      );
      return new CombinedNodeSet(descriptor.state.operator, subSets);
    });

    this.registerNodeSetType<InvertedNodeSet>('InvertedNodeSet', async (descriptor, context) => {
      const innerSet = await this.deserialize(context.client, context.model, descriptor.state.innerSet);
      return new InvertedNodeSet(context.model, innerSet);
    });
  }
}
