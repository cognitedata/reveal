import { CogniteClient } from '@cognite/sdk';
import {
  HttpResponse,
  HttpRequestOptions,
} from '@cognite/sdk-core/dist/src/httpClient/basicHttpClient';
import { isOidcEnv } from 'utils/utils';
import noop from 'lodash/noop';
import isString from 'lodash/isString';
import { DataSourceType, DataSource, ConflictMode } from './DataSource';
import JetfireApiError from './JetfireApiError';
import { RowSchema } from './Schema';
import { JobDetails } from './JobDetails';
import { Query, QueryResults } from './Query';
import TransformJob from './TransformJob';
import TransformConfig from './TransformConfig';
import { ScheduleParameters, Schedule } from './Schedule';
import {
  NotificationDestination,
  NotificationConfig,
  NotificationConfigId,
} from './NotificationConfig';
import { OidcCredentials } from './OidcCredentials';

export type MetricCounter = { timestamp: number; name: string; count: number };

export class JetfireApi {
  constructor(
    readonly cognite: CogniteClient,
    readonly project: string,
    readonly baseUrl: string
  ) {
    // stop eslint from complaining about empty constructor
  }

  schema(source: DataSource, conflictMode: ConflictMode): Promise<RowSchema> {
    switch (source.type) {
      case DataSourceType.Raw:
        return this.get(
          `/schema/${this.project}/${source.type}/${source.database}/${source.table}/${conflictMode}`
        );
      default:
        return this.get(
          `/schema/${this.project}/${source.type}/${conflictMode}`
        );
    }
  }

  getRawSchema(): Promise<RowSchema> {
    return this.get(`/schema/${this.project}/raw`);
  }

  createNotification(
    configId: number,
    destination: NotificationDestination
  ): Promise<NotificationConfigId> {
    return this.post(`/transform/config/${configId}/notifications`, {
      data: destination,
    });
  }

  deleteNotification(configId: number, notificationId: number): Promise<void> {
    return this.delete(
      `/transform/config/${configId}/notifications/${notificationId}`,
      { responseType: 'text' }
    );
  }

  listNotification(configId: number): Promise<NotificationConfig[]> {
    return this.get(`/transform/config/${configId}/notifications`);
  }

  jobDetails(configId: number): Promise<JobDetails[]> {
    return this.get(`/transform/jobDetails/${configId}`);
  }

  query(
    query: Query,
    resultsLimit?: number,
    inferSchemaLimit?: number
  ): Promise<QueryResults> {
    return this.post('/query', {
      data: query,
      params: { resultsLimit, inferSchemaLimit },
    });
  }

  transform(configId: number): Promise<TransformJob> {
    return this.post(`/transform/config/run/${configId}`);
  }

  metrics(jobId: string): Promise<MetricCounter[]> {
    return this.get(`/transform/jobs/${jobId}/metrics`);
  }

  transformConfigs({
    includePublic,
  }: {
    includePublic: boolean;
  }): Promise<TransformConfig[]> {
    const uri = '/transform/config';
    return this.get(uri, { params: flagParams({ includePublic }) });
  }

  getTransformConfig(configId: number): Promise<TransformConfig> {
    return this.get(`/transform/config/${configId}`);
  }

  postTransformConfig(config: TransformConfig): Promise<NotificationConfigId> {
    return this.post('/transform/config', { data: config });
  }

  putTransformConfig(config: TransformConfig): Promise<void> {
    return this.put(`/transform/config/${config.id}`, {
      data: config,
      responseType: 'text',
    });
  }

  deleteTransformConfig(id: number): Promise<void> {
    return this.delete(`/transform/config/${id}`, { responseType: 'text' });
  }

  setTransformConfigPublished(id: number, isPublic: boolean): Promise<void> {
    return this.put(`/transform/config/${id}/setPublished`, {
      data: { isPublic },
      responseType: 'text',
    });
  }

  setIgnoreNullUpdate(id: number, ignoreNullFields: boolean): Promise<void> {
    return this.put(`/transform/config/${id}/setIgnoreNullUpdate`, {
      data: { ignoreNullFields },
      responseType: 'text',
    });
  }

  setTransformConfigSourceOidcCredentials(
    id: number,
    creds: OidcCredentials
  ): Promise<void> {
    return this.post(`/transform/config/${id}/sourceOidcCredentials`, {
      data: creds,
      responseType: 'text',
    });
  }

  setTransformConfigDestinationOidcCredentials(
    id: number,
    creds: OidcCredentials
  ): Promise<void> {
    return this.post(`/transform/config/${id}/destinationOidcCredentials`, {
      data: creds,
      responseType: 'text',
    });
  }

  deleteTransformConfigSourceOidcCredentials(id: number): Promise<void> {
    return this.post(`/transform/config/${id}/sourceOidcCredentials`, {
      data: { setNull: true },
      responseType: 'text',
    }).then(noop);
  }

  deleteTransformConfigDestinationOidcCredentials(id: number): Promise<void> {
    return this.post(`/transform/config/${id}/destinationOidcCredentials`, {
      data: { setNull: true },
      responseType: 'text',
    }).then(noop);
  }

  setTransformConfigSourceApiKey(id: number, apiKey: string): Promise<void> {
    return this.post(`/transform/config/${id}/sourceApiKey`, {
      data: { apiKey },
      responseType: 'text',
    }).then(noop);
  }

  setTransformConfigDestinationApiKey(
    id: number,
    apiKey: string
  ): Promise<void> {
    return this.post(`/transform/config/${id}/destinationApiKey`, {
      data: { apiKey },
      responseType: 'text',
    }).then(noop);
  }

  getSchedule(configId: number): Promise<Schedule> {
    return this.get(`/schedule/config/${configId}`);
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

  postSchedule(
    configId: number,
    scheduleParam: ScheduleParameters
  ): Promise<void> {
    return this.post(`/schedule/config/${configId}`, {
      data: scheduleParam,
      responseType: 'text',
    });
  }

  deleteSchedule(configId: number): Promise<void> {
    return this.delete(`/schedule/config/${configId}`, {
      responseType: 'text',
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

  put<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.makeRequest<T>(this.cognite.put, url, options);
  }

  delete<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.makeRequest<T>(this.cognite.delete, url, options);
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

    const isOidc = isOidcEnv();

    if (isOidc) {
      preparedOptions.headers = { project: this.project };
    }

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

    if (data != null && isString(data.type) && isString(data.message)) {
      // Handle Jetfire error
      throw new JetfireApiError(data.message, data.type, status);
    } else if (
      data != null &&
      data.error != null &&
      isString(data.error.message)
    ) {
      // Handle standard CDF error
      throw new JetfireApiError(data.error.message, '', status);
    }

    switch (status) {
      case 503: {
        throw new JetfireApiError(
          "Transformations backend isn't available. Try again in a few seconds.",
          'internal',
          status
        );
      }
      case 500: {
        throw new JetfireApiError(
          'Transformations backend failed to process request.',
          'internal',
          status
        );
      }
      case 408:
      case 502: {
        throw new JetfireApiError('Request timed out.', 'internal', status);
      }
      default: {
        throw new JetfireApiError(
          'Unknown error from transformations backend.',
          'internal',
          status
        );
      }
    }
  });
}

function flagParams(flags: Record<string, boolean>): Record<string, string> {
  const params: { [name: string]: string } = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [name, flag] of Object.entries(flags)) {
    if (flag) {
      params[name] = '';
    }
  }
  return params;
}
