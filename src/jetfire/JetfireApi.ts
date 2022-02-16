import {
  CogniteClient,
  HttpResponse,
  HttpRequestOptions,
  HttpQueryParams,
} from '@cognite/sdk';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { ItemsWithCursor } from './types/ItemsWithCursor';
import { DataSource, ConflictMode } from './types/DataSource';
import JetfireApiError from './JetfireApiError';
import { ColumnSchema } from './types/Schema';
import { QueryResultsResponse, QueryResults } from './types/Query';
import { Job } from './types/Job';
import { Transformation } from './types/Transformation';
import { Schedule } from './types/Schedule';
import { Notification } from './types/Notification';
import { OidcCredentials } from './types/OidcCredentials';
import { Items } from './types/Items';
import { v4 as uuidv4 } from 'uuid';

export type MetricCounter = { timestamp: number; name: string; count: number };

export class JetfireApi {
  constructor(
    readonly cognite: CogniteClient,
    readonly project: string,
    readonly baseUrl: string
  ) {
    // stop eslint from complaining about empty constructor
  }

  updateTransformationResources<T, A>(
    id: number,
    updateBody: T,
    requestUri: string = '/update'
  ): Promise<A> {
    return this.post(requestUri, {
      data: { items: [{ update: updateBody, id }] },
    });
  }

  schema(
    source: DataSource,
    conflictMode: ConflictMode
  ): Promise<ColumnSchema[]> {
    return this.get(`/schema/${source.type}`, {
      params: { conflictMode },
    }).then((schemaLst) => (schemaLst as Items<ColumnSchema>).items);
  }

  createNotification(notification: Notification): Promise<Notification> {
    return this.post('/notifications', {
      data: { items: [notification] },
    }).then((nlist) => (nlist as Items<Notification>).items[0]);
  }

  deleteNotification(notificationId: number): Promise<void> {
    return this.post('/notifications/delete', {
      data: { items: [{ id: notificationId }] },
    });
  }

  listNotification(configId: number): Promise<Notification[]> {
    return this.get('/notifications', {
      params: { transformationId: configId, limit: 1000 },
    }).then((nList) => (nList as Items<Notification>).items);
  }

  /* eslint-disable no-await-in-loop */
  async jobDetails(configId: number): Promise<Job[]> {
    const uri = '/jobs';
    let jobs: Job[] = [];
    let cursor = null;

    do {
      const params: HttpQueryParams = {
        transformationId: configId,
        limit: '1000',
      };
      if (cursor) params.cursor = cursor;

      const chunk = (await this.get(uri, { params })) as ItemsWithCursor<Job>;

      cursor = chunk.nextCursor;
      jobs = jobs.concat(chunk.items);
    } while (cursor);

    return jobs;
  }
  /* eslint-enable */

  query(
    query: string,
    sourceLimit?: number,
    inferSchemaLimit?: number
  ): Promise<QueryResults> {
    return this.post('/query/run', {
      data: {
        query,
        convertToString: true,
        sourceLimit,
        limit: 1000,
        inferSchemaLimit,
      },
    }).then((queryRes) => {
      const {
        schema,
        results,
      }: {
        schema: Items<ColumnSchema>;
        results: Items<{ [K: string]: string }>;
      } = queryRes as QueryResultsResponse;
      return { schema: schema.items, results: results.items };
    });
  }

  transform(configId: number): Promise<Job> {
    return this.post('/run', { data: { id: configId } });
  }

  cancel(configId: number): Promise<void> {
    return this.post('/cancel', { data: { id: configId } });
  }

  metrics(jobId: number): Promise<MetricCounter[]> {
    return this.get(`/jobs/${jobId}/metrics`).then(
      (mList) => (mList as Items<MetricCounter>).items
    );
  }

  /* eslint-disable no-await-in-loop */
  async transformConfigs({
    includePublic,
  }: {
    includePublic: boolean;
  }): Promise<Transformation[]> {
    const uri = '/';
    let transformations: Transformation[] = [];
    let cursor = null;
    do {
      const params: HttpQueryParams = {
        includePublic: includePublic.toString(),
        limit: '1000',
      };
      if (cursor) params.cursor = cursor;

      const chunk = (await this.get(uri, {
        params,
      })) as ItemsWithCursor<Transformation>;

      cursor = chunk.nextCursor;
      transformations = transformations.concat(chunk.items);
    } while (cursor);
    return transformations;
  }
  /* eslint-enable */

  getTransformConfig(configId: number): Promise<Transformation> {
    return this.post('/byids', { data: { items: [{ id: configId }] } }).then(
      (tlist) => (tlist as Items<Transformation>).items[0]
    );
  }

  getTransformConfigs(ids: number[]): Promise<Transformation[]> {
    return this.post('/byids', {
      data: { items: ids.map((id) => ({ id })) },
    }).then((tlist) => (tlist as Items<Transformation>).items);
  }

  postTransformConfig(config: Transformation): Promise<Transformation> {
    return this.post('/', {
      data: { items: [{ externalId: uuidv4(), ...config }] },
    }).then((tlist) => (tlist as Items<Transformation>).items[0]);
  }

  updateTransformConfig(config: Transformation): Promise<void> {
    // TransformationSynchronizer only updates the following properties
    return this.updateTransformationResources(config.id!, {
      name: { set: config.name },
      destination: { set: config.destination },
      conflictMode: { set: config.conflictMode },
      query: { set: config.query },
      // Do not set externalId to null
      externalId: config.externalId ? { set: config.externalId } : undefined,
    }).then(noop);
  }

  deleteTransformConfig(id: number): Promise<void> {
    return this.post('/delete', { data: { items: [{ id }] } });
  }

  setTransformConfigPublished(id: number, isPublic: boolean): Promise<void> {
    return this.updateTransformationResources(id, {
      isPublic: { set: isPublic },
    }).then(noop);
  }

  setIgnoreNullUpdate(id: number, ignoreNullFields: boolean): Promise<void> {
    return this.updateTransformationResources(id, {
      ignoreNullFields: { set: ignoreNullFields },
    }).then(noop);
  }

  filterEmptyStr(creds: OidcCredentials): OidcCredentials {
    return Object.keys(creds)
      .filter((key) => (creds as any)[key] !== '')
      .reduce((newObject, current) => {
        newObject[current] = (creds as any)[current]; // eslint-disable-line no-param-reassign
        return newObject;
      }, {} as any);
  }
  setTransformConfigSourceOidcCredentials(
    id: number,
    creds: OidcCredentials
  ): Promise<void> {
    const filteredObject = this.filterEmptyStr(creds);
    return this.updateTransformationResources(id, {
      sourceOidcCredentials: { set: filteredObject },
    }).then(noop);
  }

  setTransformConfigDestinationOidcCredentials(
    id: number,
    creds: OidcCredentials
  ): Promise<void> {
    const filteredObject = this.filterEmptyStr(creds);
    return this.updateTransformationResources(id, {
      destinationOidcCredentials: { set: filteredObject },
    }).then(noop);
  }

  deleteTransformConfigSourceOidcCredentials(id: number): Promise<void> {
    return this.updateTransformationResources(id, {
      sourceOidcCredentials: { setNull: true },
    }).then(noop);
  }

  deleteTransformConfigDestinationOidcCredentials(id: number): Promise<void> {
    return this.updateTransformationResources(id, {
      destinationOidcCredentials: { setNull: true },
    }).then(noop);
  }

  setTransformConfigSourceApiKey(id: number, apiKey: string): Promise<void> {
    return this.updateTransformationResources(id, {
      sourceApiKey: { set: apiKey },
    }).then(noop);
  }

  setTransformConfigDestinationApiKey(
    id: number,
    apiKey: string
  ): Promise<void> {
    return this.updateTransformationResources(id, {
      destinationApiKey: { set: apiKey },
    }).then(noop);
  }

  deleteTransformConfigSourceApiKey(id: number): Promise<void> {
    return this.updateTransformationResources(id, {
      sourceApiKey: { setNull: true },
    }).then(noop);
  }

  deleteTransformConfigDestinationApiKey(id: number): Promise<void> {
    return this.updateTransformationResources(id, {
      destinationApiKey: { setNull: true },
    }).then(noop);
  }

  getSchedule(configId: number): Promise<Schedule> {
    return this.get('schedules/byids', {
      data: { items: [{ id: configId }] },
    }).then((slist) => (slist as Items<Schedule>).items[0]);
  }

  async tryGetSchedule(configId: number): Promise<Schedule | undefined> {
    try {
      return await this.getSchedule(configId);
    } catch (e) {
      if (e instanceof JetfireApiError && e.requestStatus === 404) {
        return undefined;
      }
      throw e;
    }
  }

  postSchedule(schedule: Schedule): Promise<void> {
    return this.post('/schedules', {
      data: { items: [schedule] },
    }).then(noop);
  }

  updateSchedule(schedule: Schedule): Promise<void> {
    const {
      id,
      interval,
      isPaused,
    }: { id: number; interval: string; isPaused?: boolean } = schedule;

    return this.updateTransformationResources(
      id,
      {
        interval: { set: interval },
        isPaused: { set: isPaused },
      },
      '/schedules/update'
    ).then(noop);
  }

  deleteSchedule(configId: number): Promise<void> {
    return this.post('/schedules/delete', {
      data: { items: [{ id: configId }] },
    });
  }

  resolveUrl(url: string): string {
    return this.baseUrl + url;
  }

  get<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.makeRequest<T>(this.cognite.get, url, options);
  }

  post<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.makeRequest<T>(this.cognite.post, url, options);
  }

  private async makeRequest<T>(
    request: (
      url: string,
      options?: HttpRequestOptions
    ) => Promise<HttpResponse<T>>,
    endpoint: string,
    options?: HttpRequestOptions
  ): Promise<T> {
    // The cognite SDK will traverse response bodies,
    // look for fields named 'timestamp', 'createdTime', etc,
    // and replace them with javascript Date objects.
    //
    // This will break job metrics (where timestamps are in seconds),
    // as well as query results where the result contains a column
    // named e.g. 'timestamp', where the value is not in milliseconds since epoch.
    //
    // Therefore, perform the request with { responseType: 'text' }, and
    // manually convert the response to JSON if this was requested.
    //
    // https://github.com/cognitedata/cognite-sdk-js/issues/333

    const preparedOptions: HttpRequestOptions = {
      ...options,
      withCredentials: true,
      responseType: 'text',
    };

    const url = this.resolveUrl(endpoint);
    const response = await catchToApiError(request(url, preparedOptions));
    if (options && options.responseType === 'text') {
      return response.data;
    }
    return JSON.parse(response.data as any);
  }
}

function catchToApiError<T>(
  promise: Promise<HttpResponse<T>>
): Promise<HttpResponse<T>> {
  return promise.catch((error) => {
    const { status = undefined, data: json = undefined } = { ...error };

    let data;

    if (!status && !json) {
      throw error;
    }

    try {
      data = JSON.parse(json);
    } catch {
      // We failed to parse the response, so we fall back to
      // throwing an error based on HTTP status code.
    }

    if (data != null && data.error != null && isString(data.error.message)) {
      throw new JetfireApiError(data.error.message, status);
    }

    switch (status) {
      case 503: {
        throw new JetfireApiError(
          "Transformations backend isn't available. Try again in a few seconds.",
          status
        );
      }
      case 500: {
        throw new JetfireApiError(
          'Transformations backend failed to process request.',
          status
        );
      }
      case 408:
      case 502: {
        throw new JetfireApiError('Request timed out.', status);
      }
      default: {
        throw new JetfireApiError(
          'Unknown error from transformations backend.',
          status
        );
      }
    }
  });
}
