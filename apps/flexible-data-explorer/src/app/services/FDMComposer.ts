import { merge } from 'lodash';

import { FDMClientV2 } from './FDMClientV2';
import { DataType, EdgeRelationshipResponse, SearchResponse } from './types';

export class FDMComposer {
  private clients: FDMClientV2[] | undefined;

  constructor(clients: FDMClientV2[] | undefined) {
    this.clients = clients;
  }

  private getClient(dataModel: string, version: string, space: string) {
    return this.clients?.find((client) => {
      return (
        client.schema.dataModel.externalId === dataModel &&
        client.schema.dataModel.version === version &&
        client.schema.dataModel.space === space
      );
    });
  }

  public get allDataTypes() {
    const schema = (this.clients || []).flatMap(
      (client) => client.schema.types
    );

    return schema;
  }

  public getTypesByDataType(dataType?: string) {
    if (!dataType) {
      return undefined;
    }

    const types = this.allDataTypes.find((type) => type.name === dataType);

    return types;
  }

  public getDataModelByDataType(dataType: string) {
    const client = this.clients?.find((client) => {
      return client.schema.types.some((type) => type.name === dataType);
    });

    return client?.schema.dataModel;
  }

  public async search(query: string, filters: Record<string, unknown>) {
    const promises = await Promise.allSettled(
      (this.clients || []).map(async (client) => {
        const results = await client.searchDataTypes(query, filters);

        return results;
      })
    );

    return promises.reduce((acc, item) => {
      if (item.status === 'rejected') {
        return acc;
      }

      return merge(acc, item.value);
    }, {} as Record<string, SearchResponse>);
  }

  public async searchAggregateCount(
    query: string,
    filters: Record<string, unknown>
  ) {
    const promises = await Promise.allSettled(
      (this.clients || []).map(async (client) => {
        const results = await client.searchAggregateCount(query, filters);

        return results;
      })
    );

    return promises.reduce((acc, item) => {
      if (item.status === 'rejected') {
        return acc;
      }

      return merge(acc, item.value);
    }, {} as Record<string, number>);
  }

  public async searchAggregateValueByProperty<T>(
    data: { dataType: string; field: string },
    query: string,
    filters: unknown,
    property: string
  ) {
    const dataModel = this.getDataModelByDataType(data.dataType);

    if (!dataModel) {
      return undefined;
    }

    const client = this.getClient(
      dataModel.externalId,
      dataModel.version,
      dataModel.space
    );

    if (!client) {
      return undefined;
    }

    const result = await client.searchAggregateValueByProperty<T>(
      data,
      query,
      filters,
      property
    );

    return result;
  }

  public async searchAggregateValues(
    data: { dataType: string; field: string },
    query: string,
    filters: unknown
  ) {
    const dataModel = this.getDataModelByDataType(data.dataType);

    if (!dataModel) {
      return Promise.resolve([] as string[]);
    }

    const client = this.getClient(
      dataModel.externalId,
      dataModel.version,
      dataModel.space
    );

    if (!client) {
      return Promise.resolve([] as string[]);
    }

    const results = await client.searchAggregateValues(data, query, filters);

    return results;
  }

  public aiSearch(
    dataModel?: { externalId: string; version: string; space: string },
    query?: string,
    variables: Record<string, unknown> = {}
  ) {
    if (!dataModel || !query) {
      return Promise.resolve({} as Record<DataType, SearchResponse>);
    }
    return this.getClient(
      dataModel.externalId,
      dataModel.version,
      dataModel.space
    )?.aiSearch(query, variables);
  }

  public async getInstancesById(header: {
    dataType: string;
    externalId: string;
    instanceSpace: string;
    dataModel: string;
    version: string;
    space: string;
  }) {
    const client = this.getClient(
      header.dataModel,
      header.version,
      header.space
    );

    if (!client) {
      return Promise.reject(new Error('Missing client...'));
    }

    const primitiveFields = client.schema.getPrimitiveFields(header.dataType);

    const instance = await client.getInstanceById<Record<string, any>>(
      primitiveFields,
      {
        instanceSpace: header.instanceSpace,
        dataType: header.dataType,
        externalId: header.externalId,
      }
    );

    return instance;
  }

  public getDirectRelationships(
    dataType: string | undefined,
    headers: {
      dataModel?: string;
      version?: string;
      space?: string;
    }
  ) {
    if (!(headers.dataModel && headers.version && headers.space)) {
      return [];
    }

    const client = this.getClient(
      headers.dataModel,
      headers.version,
      headers.space
    );

    if (!dataType || !client) {
      return [];
    }

    return client.schema.getDirectRelationships(dataType);
  }

  public listEdgeRelationships(
    dataType: string | undefined,
    headers: {
      dataModel?: string;
      version?: string;
      space?: string;
    }
  ) {
    if (!(headers.dataModel && headers.version && headers.space)) {
      return [];
    }

    const client = this.getClient(
      headers.dataModel,
      headers.version,
      headers.space
    );

    if (!dataType || !client) {
      return [];
    }

    return client.schema.listEdgeRelationships(dataType);
  }

  public async getDirectRelationshipInstancesById(
    relationship: {
      relatedType: string;
      relatedField: string;
    },
    header: {
      dataType: string;
      externalId: string;
      instanceSpace: string;
      dataModel: string;
      version: string;
      space: string;
    }
  ) {
    const client = this.getClient(
      header.dataModel,
      header.version,
      header.space
    );

    if (!client) {
      return Promise.reject(new Error('Missing client...'));
    }

    const primitiveFields = client.schema.getPrimitiveFields(
      relationship?.relatedType
    );

    const fields = [
      {
        [relationship.relatedField]: primitiveFields,
      },
    ];

    const instance = await client.getInstanceById<any>(fields, {
      instanceSpace: header.instanceSpace,
      dataType: header.dataType,
      externalId: header.externalId,
    });

    return instance;
  }

  public async getEdgeRelationshipInstancesById(
    filters: Record<string, any> | undefined,
    entry: {
      relatedType: string;
      relatedField: string;
      fields?: any[];
      edges?: any[];
    },
    instance: {
      dataType: string;
      externalId: string;
      instanceSpace: string;
      dataModel: string;
      version: string;
      space: string;
    },
    context: {
      cursor?: string;
    }
  ) {
    const client = this.getClient(
      instance.dataModel,
      instance.version,
      instance.space
    );

    if (!client) {
      return Promise.reject(new Error('Missing client...'));
    }

    const primitiveFields = client.schema.getPrimitiveFields(
      entry?.relatedType
    );

    const fields = [
      {
        operation: entry.relatedField,
        variables: {
          first: 100,
          after: context.cursor,
          filter: {
            value: filters || {},
            name: 'filter',
            type: `_List${entry.relatedType}Filter`,
          },
        },
        fields: [
          {
            items: [...(entry.fields || []), ...primitiveFields],
          },
          entry.edges ? { edges: entry.edges } : undefined,
          { pageInfo: ['hasNextPage', 'endCursor'] },
        ].filter(Boolean),
      },
    ];

    const result = await client.getInstanceById<EdgeRelationshipResponse>(
      fields,
      {
        instanceSpace: instance.instanceSpace,
        dataType: instance.dataType,
        externalId: instance.externalId,
      }
    );

    return result;
  }
}
