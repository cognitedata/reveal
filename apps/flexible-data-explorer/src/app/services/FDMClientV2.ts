// This file contains a bare-bones version of
// https://github.com/cognitedata/industry-apps/blob/master/packages/e2e-fdm/src/fdm/fdm-client.ts

import { query } from 'gql-query-builder';
import Fields from 'gql-query-builder/build/Fields';
import head from 'lodash/head';

import type { CogniteClient } from '@cognite/sdk';

import { BASE_FIELDS } from './constants';
import { FDMSchema } from './FDMSchema';
import {
  DataModelByIdResponse,
  DataModelListResponse,
  DataModelV2,
  DataType,
  Instance,
  SearchAggregateCountResponse,
  SearchAggregateValueResponseByProperty,
  SearchAggregateValuesResponse,
  SearchResponse,
} from './types';

export interface FDMError {
  extensions: { classification: string };
  locations: { column: number; line: number };
  message: string;
}

/**
 * This class can be used for interactions with CDF
 * You can create your own class that extends from this one
 * and add methods that handle data that is specific to your application.
 *
 * TODO: init the class once and use context to consume...
 */
export class BaseFDMClient {
  // private DMS_HEADERS: Record<string, string>;
  protected BASE_URL: string;
  protected client: CogniteClient;

  constructor(client: CogniteClient) {
    this.client = client;
    this.BASE_URL = `${client.getBaseUrl()}/api/v1/projects/${client.project}`;
  }

  public request<T>(
    url: string,
    data: { query: string; variables?: Record<string, any> }
  ) {
    return this.client
      .post<{ data: T; errors: FDMError[] }>(url, {
        data,
      })
      .then((result) => {
        if (result.data.errors) {
          const { errors } = result.data;
          throw new Error(
            errors.length > 0
              ? JSON.stringify(errors.map((error) => error.message))
              : 'Error connecting to server'
          );
        }
        return result.data.data;
      });
  }

  public dmlRequest<T>(data: {
    query: string;
    variables?: Record<string, any>;
  }) {
    const url = `${this.BASE_URL}/dml/graphql`;

    return this.request<T>(url, data);
  }

  public async listDataModels(limit = 100) {
    const operation = 'listGraphQlDmlVersions';

    const data = query({
      operation,
      fields: [
        {
          items: [
            'space',
            'externalId',
            'version',
            'name',
            'description',
            'createdTime',
            'lastUpdatedTime',
          ],
        },
      ],
      variables: { limit },
    });

    const {
      [operation]: { items },
    } = await this.dmlRequest<{
      [operation]: {
        items: DataModelListResponse[];
      };
    }>(data);

    return items;
  }

  public async getDataModelById({ space, externalId, version }: DataModelV2) {
    const operation = 'graphQlDmlVersionsById';

    const data = query({
      operation,
      fields: [
        {
          items: [
            'name',
            'externalId',
            'description',
            'space',
            'graphQlDml',
            'version',
          ],
        },
      ],
      variables: {
        space: { value: space, required: true },
        externalId: { value: externalId, required: true },
      },
    });

    const {
      [operation]: { items },
    } = await this.dmlRequest<{
      [operation]: {
        items: DataModelByIdResponse[];
      };
    }>(data);

    return items.find((item) => item.version === String(version));
  }
}

export class FDMClientV2 extends BaseFDMClient {
  public schema: FDMSchema;

  constructor(client: CogniteClient, schema: FDMSchema) {
    super(client);
    this.schema = schema;
  }

  public gqlRequest<T>(data: {
    query: string;
    variables?: Record<string, any>;
  }): Promise<T> {
    const { externalId, space, version } = this.schema.dataModel;
    const url = `${this.BASE_URL}/userapis/spaces/${space}/datamodels/${externalId}/versions/${version}/graphql`;

    return this.request<T>(url, data);
  }

  public async getInstanceById<T>(
    fields: Fields,
    { dataType, externalId, instanceSpace }: Instance
  ) {
    const operation = `get${dataType}ById`;

    const payload = query({
      operation,
      fields: [
        {
          items: fields,
        },
      ],
      variables: {
        instance: {
          type: 'InstanceRef = {space: "", externalId: ""}',
          value: { externalId, space: instanceSpace },
        },
      },
    });

    const {
      [operation]: { items },
    } = await this.gqlRequest<{
      [operation in string]: {
        items: T[];
      };
    }>(payload);

    return head(items);
  }

  public async aiSearch(queryString: string, variables: Record<string, any>) {
    const payload = { variables, query: queryString };

    const result = await this.gqlRequest<Record<DataType, SearchResponse>>(
      payload
    );

    return result;
  }

  public async searchDataTypes(
    queryString: string,
    filters: Record<string, unknown>
  ) {
    const constructPayload = this.schema.types.map((item) => {
      const dataType = item.name;

      const fields = this.schema.getPrimitiveFields(dataType);

      return {
        operation: { name: `search${dataType}`, alias: dataType },
        fields: [
          {
            items: [...fields, ...BASE_FIELDS],
          },
        ],
        variables: {
          query: { value: queryString, required: true },
          [`filter${dataType}`]: {
            value: filters[dataType] || {},
            name: 'filter',
            type: `_Search${dataType}Filter`,
          },
        },
      };
    });

    const payload = query(constructPayload);

    const result = await this.gqlRequest<Record<DataType, SearchResponse>>(
      payload
    );

    return result;
  }

  public async searchAggregateCount(
    queryString: string,
    filters: Record<string, unknown>
  ) {
    const constructPayload = this.schema.types.map((item) => {
      const dataType = item.name;

      return {
        operation: { name: `aggregate${dataType}`, alias: dataType },
        fields: [
          {
            items: [
              {
                count: ['externalId'],
              },
            ],
          },
        ],
        variables: {
          query: { value: queryString, required: true },
          [`filter${dataType}`]: {
            value: filters[dataType] || {},
            name: 'filter',
            type: `_Search${dataType}Filter`,
          },
        },
      };
    });

    const payload = query(constructPayload);

    const result = await this.gqlRequest<
      Record<DataType, SearchAggregateCountResponse>
    >(payload);

    const normalizeResult = Object.entries(result ?? {}).reduce(
      (acc, [key, value]) => {
        const count = value.items?.[0]?.count?.externalId;

        return {
          ...acc,
          [key]: count,
        };
      },
      {} as Record<DataType, number>
    );

    return normalizeResult;
  }

  public async searchAggregateValueByProperty<T>(
    data: { dataType: string; field: string },
    queryString: string,
    filters: unknown,
    property: string
  ) {
    const { dataType, field } = data;

    const constructPayload = {
      operation: { name: `aggregate${dataType}`, alias: dataType },
      fields: [
        {
          items: [
            {
              [property]: [field],
            },
          ],
        },
      ],
      variables: {
        query: { value: queryString, required: true },
        filter: {
          value: filters,
          type: `_Search${dataType}Filter`,
        },
      },
    };

    const payload = query(constructPayload);

    const result = await this.gqlRequest<
      Record<DataType, SearchAggregateValueResponseByProperty<T>>
    >(payload);

    const value = head(result[dataType]?.items)?.[property]?.[field];

    return value;
  }

  public async searchAggregateValues(
    data: { dataType: string; field: string },
    queryString: string,
    filters: unknown
  ) {
    const { dataType, field } = data;

    const constructPayload = {
      operation: { name: `aggregate${dataType}`, alias: dataType },
      fields: [
        {
          items: [
            {
              count: ['externalId'],
            },
            'group',
          ],
        },
      ],
      variables: {
        query: { value: queryString, required: true },
        filter: {
          value: filters,
          type: `_Search${dataType}Filter`,
        },
        groupBy: {
          value: field,
          type: `[_Search${dataType}Fields!]`,
        },
      },
    };

    const payload = query(constructPayload);

    const result = await this.gqlRequest<
      Record<DataType, SearchAggregateValuesResponse>
    >(payload);

    const normalizeResult = result[dataType]?.items.map(
      ({ group }) => group[field]
    );

    return normalizeResult;
  }
}
