import { useParams } from 'react-router-dom';

import {
  QueryClient,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { BASE_QUERY_KEY, useTranslation } from '@transformations/common';
import {
  getDefaultMapping,
  getQuery,
  getTransformationMapping,
  getUpdateMapping,
} from '@transformations/components/source-mapping/utils';
import { getJobListQueryKey } from '@transformations/hooks';
import {
  PreviewRowLimit,
  PreviewSourceLimit,
  useTransformationContext,
} from '@transformations/pages/transformation-details/TransformationContext';
import {
  SdkListData,
  TransformationRead,
  TransformationCreate,
  TransformationListQueryParams,
  TransformationUpdate,
  UpdateItemWithId,
  Schema,
  TransformationCreateError,
  NetworkError,
  isFDMDestination,
  isViewCentric,
  isDataModelCentric,
} from '@transformations/types';
import {
  createInternalLink,
  FIVE_MINUTES,
  getTransformationsApiUrl,
} from '@transformations/utils';
import { useCdfUserHistoryService } from '@user-history';
import { notification } from 'antd';
import { v4 as uuidv4 } from 'uuid';

import { Timestamp } from '@cognite/cdf-utilities';
import { CogniteClient, CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { getModel } from './fdm';
import { Session, useCreateSession, useRevokeSession } from './sessions';

export const getTransformationListQueryKey = () => [
  BASE_QUERY_KEY,
  'transformation-list',
];

export const getTransformationKey = (id: number) => [
  BASE_QUERY_KEY,
  'transformation',
  id,
];

const getTransformationPreviewKeyBase = () => [BASE_QUERY_KEY, 'preview'];

export const getTransformationPreviewKey = (
  query: string,
  limit: number,
  sourceLimit: number,
  previewKey: string
) => [
  ...getTransformationPreviewKeyBase(),
  query,
  limit,
  sourceLimit,
  previewKey,
];

export const getTransformationMutationKey = () => ['transformations', 'update'];
export const getTransformationCredentialsMutationKey = () => [
  'transformations',
  'update',
  'credentials',
];

export const getTransformation = (
  transformationId: number,
  sdk: CogniteClient,
  client: QueryClient
) =>
  client.fetchQuery(getTransformationKey(transformationId), () =>
    sdk
      .post<SdkListData<TransformationRead>>(
        getTransformationsApiUrl('/byids'),
        {
          data: {
            items: [{ id: transformationId }],
          },
        }
      )
      .then(({ data }) => data.items[0])
  );

export const useTransformation = (
  transformationId: number,
  options: UseQueryOptions<
    TransformationRead,
    CogniteError,
    TransformationRead
  > = { enabled: true }
) => {
  const sdk = useSDK();

  return useQuery<TransformationRead, CogniteError, TransformationRead>(
    getTransformationKey(transformationId),
    () =>
      sdk
        .post<SdkListData<TransformationRead>>(
          getTransformationsApiUrl('/byids'),
          {
            data: {
              items: [{ id: transformationId }],
            },
          }
        )
        .then(({ data }) => data.items[0]),
    {
      ...options,
      enabled: !!transformationId && options.enabled,
    }
  );
};

export const useTransformationList = (
  params: TransformationListQueryParams = {
    includePublic: true,
    limit: 1000,
  },
  options?: UseInfiniteQueryOptions<
    SdkListData<TransformationRead>,
    CogniteError,
    SdkListData<TransformationRead>,
    SdkListData<TransformationRead>,
    string[]
  >
) => {
  const sdk = useSDK();

  return useInfiniteQuery<
    SdkListData<TransformationRead>,
    CogniteError,
    SdkListData<TransformationRead>,
    string[]
  >(
    getTransformationListQueryKey(),
    ({ pageParam = undefined }) =>
      sdk
        .get<SdkListData<TransformationRead>>(getTransformationsApiUrl('/'), {
          params: {
            ...params,
            cursor: pageParam,
          },
        })
        .then(({ data }) => data),
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      ...options,
    }
  );
};

export const useDeleteTransformation = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation<any, CogniteError, TransformationRead['id'][]>(
    (ids: TransformationRead['id'][] = []) =>
      sdk.post(getTransformationsApiUrl('/delete'), {
        data: {
          items: ids.map((id) => ({ id })),
        },
      }),
    {
      onSuccess: (_, ids) => {
        queryClient.invalidateQueries(getTransformationListQueryKey());
        ids?.forEach((id) =>
          queryClient.removeQueries(getTransformationKey(id))
        );
      },
    }
  );
};

export const useCreateTrasformationKey = () => ['transformations', 'create'];
type CreateParams = {
  transformation: TransformationCreate;
  addMapping?: boolean;
  ignoreMappingFailure?: boolean;
};
export const useCreateTransformation = (
  options?: UseMutationOptions<
    TransformationRead,
    TransformationCreateError,
    CreateParams
  >
) => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const userHistoryService = useCdfUserHistoryService();

  return useMutation<
    TransformationRead,
    TransformationCreateError,
    CreateParams
  >(
    useCreateTrasformationKey(),
    async ({ transformation, addMapping, ignoreMappingFailure }) => {
      const {
        externalId,
        dataSetId,
        destination,
        conflictMode,
        ignoreNullFields,
        query = '',
      } = transformation;

      const mapping = addMapping
        ? await (async () => {
            try {
              return getDefaultMapping(sdk, queryClient, transformation);
            } catch (e) {
              if (ignoreMappingFailure) {
                return undefined;
              } else {
                throw e;
              }
            }
          })()
        : undefined;
      const newQuery =
        addMapping && mapping
          ? getQuery(mapping, transformation.destination)
          : query;

      return sdk
        .post<{ items: TransformationRead[] }>(getTransformationsApiUrl(), {
          data: {
            items: [
              {
                ...transformation,
                query: newQuery,
                externalId: externalId.trim(),
                isPublic: true,
                ...(dataSetId ? { dataSetId } : {}),
                ...(destination ? { destination } : {}),
                ...(conflictMode ? { conflictMode } : {}),
                ...(ignoreNullFields !== undefined ? { ignoreNullFields } : {}),
              },
            ],
          },
        })
        .then((r) => {
          if (r.status === 200) {
            return r.data.items[0];
          } else {
            return Promise.reject(r);
          }
        });
    },
    {
      ...options,
      onSuccess: (transformation) => {
        if (subAppPath && transformation?.name && transformation?.id)
          userHistoryService.logNewResourceEdit({
            application: subAppPath,
            name: transformation.name,
            path: createInternalLink(`${transformation.id}`),
          });
        queryClient.invalidateQueries(getTransformationListQueryKey());
      },
    }
  );
};

type UseTransformationTVariables = {
  id: number;
  personalCredentials?: boolean;
};
export const useRunTransformation = (
  options?: Omit<
    UseMutationOptions<any, unknown, UseTransformationTVariables, unknown>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  const { t } = useTranslation();
  const { mutateAsync: createSession } = useCreateSession();

  return useMutation<any, NetworkError, UseTransformationTVariables>(
    async ({
      id,
      personalCredentials = false,
    }: UseTransformationTVariables) => {
      const session = personalCredentials
        ? await createSession({
            project: sdk.project,
            credentials: { tokenExchange: true },
          })
        : undefined;
      return sdk.post(getTransformationsApiUrl('/run'), {
        data: {
          id,
          nonce: session
            ? {
                sessionId: session?.id,
                nonce: session?.nonce,
                cdfProjectName: sdk.project,
              }
            : undefined,
        },
      });
    },
    {
      ...options,
      onSuccess: (_, v, c) => {
        queryClient.invalidateQueries(getTransformationListQueryKey());
        queryClient.invalidateQueries(getJobListQueryKey(v.id));
        notification.success({ message: t('job-started') });
        if (options?.onSuccess) {
          options.onSuccess(_, v, c);
        }
      },
      onError: (error, _, __) => {
        const { status, errorMessage, requestId } = error;
        notification.error({
          message: t('job-failed-to-start'),
          description: status && (
            <>
              <p>{t('create-transformation-error-code', { code: status })}</p>
              <p>
                {t('api-error-message', {
                  error: errorMessage,
                })}
              </p>
              <p>
                {t('create-transformation-error-request-id', { requestId })}
              </p>
            </>
          ),
        });
        if (options?.onError) {
          options.onError(error, _, __);
        }
      },
    }
  );
};

export const useRunTransformationAndOpenTab = () => {
  const { addTab, setActiveInspectSectionKey } = useTransformationContext();

  return useRunTransformation({
    onSuccess: ({ data }) => {
      addTab({
        key: `${data.id}`,
        type: 'run-history',
        jobId: data.id,
        title: <Timestamp absolute timestamp={data.createdTime} />,
        icon: 'News',
      });
      setActiveInspectSectionKey('run-history');
    },
  });
};

export type QueryPreviewData = {
  schema: {
    items: Schema[];
  };
  results: {
    items: any[];
  };
  sql: string;
};

type QueryPreviewBase = {
  query?: string;
  duration?: number;
};

export type QueryPreviewSuccess = QueryPreviewBase & {
  data?: QueryPreviewData;
  invalidQuery: boolean;
  errorFeedback?: string;
};

export type QueryPreviewError = QueryPreviewBase & {
  error: CogniteError;
};

const postTransformationPreview = async (
  query: string,
  limit: number,
  sourceLimit: number,
  sdk: CogniteClient
) => {
  const start = Date.now();
  return sdk
    .post<QueryPreviewData>(getTransformationsApiUrl('/query/run'), {
      data: {
        limit,
        sourceLimit: sourceLimit !== -1 ? sourceLimit : undefined,
        query,
        convertToString: true,
      },
    })
    .then(({ data }) => ({
      data,
      query,
      invalidQuery: false,
      duration: Date.now() - start,
    }))
    .catch((error) => {
      if (error.status === 400) {
        return Promise.resolve({
          data: undefined,
          invalidQuery: true,
          errorFeedback: error.message as string,
          query,
          duration: Date.now() - start,
        });
      } else {
        throw {
          error,
          query,
          duration: Date.now() - start,
        };
      }
    });
};

export const useTransformationPreview = (
  query: string,
  limit: PreviewRowLimit,
  sourceLimit: PreviewSourceLimit,
  previewKey: string,
  options?: Omit<
    UseQueryOptions<
      QueryPreviewSuccess,
      QueryPreviewError,
      QueryPreviewSuccess
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const sdk = useSDK();

  return useQuery<QueryPreviewSuccess, QueryPreviewError>(
    getTransformationPreviewKey(query, limit, sourceLimit, previewKey),
    () => postTransformationPreview(query, limit, sourceLimit, sdk),
    { ...options, staleTime: FIVE_MINUTES }
  );
};

export const useRunTransformations = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation(
    (ids: number[]) => {
      return Promise.allSettled(
        ids.map((id) =>
          sdk.post(getTransformationsApiUrl('/run'), {
            data: { id },
          })
        )
      ).catch((error) => error.response);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(getTransformationListQueryKey());
      },
    }
  );
};

export const useDuplicateTransformation = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation(
    async (items: Omit<TransformationCreate, 'externalId'>[] = []) =>
      sdk.post<TransformationRead[]>(getTransformationsApiUrl('/'), {
        data: {
          items: items?.map((transformation) => ({
            name: `${transformation.name} copy`,
            destination: transformation.destination,
            conflictMode: transformation.conflictMode,
            externalId: uuidv4(),
            ignoreNullFields: transformation.ignoreNullFields,
            dataSetId: transformation.dataSetId,
            query: transformation.query,
            isPublic: transformation.isPublic,
          })),
        },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(getTransformationListQueryKey());
      },
    }
  );
};

type Update = UpdateItemWithId<
  Pick<
    TransformationUpdate,
    | 'name'
    | 'externalId'
    | 'destination'
    | 'conflictMode'
    | 'query'
    | 'isPublic'
    | 'ignoreNullFields'
  >,
  Pick<
    TransformationUpdate,
    | 'sourceOidcCredentials'
    | 'destinationOidcCredentials'
    | 'sourceApiKey'
    | 'destinationApiKey'
    | 'dataSetId'
    | 'sourceNonce'
    | 'destinationNonce'
  >
> & {
  updateMapping?: boolean;
  ignoreMappingErrors?: boolean;
};
export const useUpdateTransformation = (
  options?: Omit<
    UseMutationOptions<TransformationRead, CogniteError, Update, unknown>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const sdk = useSDK();

  const { subAppPath } = useParams<{ subAppPath?: string }>();
  const userHistoryService = useCdfUserHistoryService();

  return useMutation<TransformationRead, CogniteError, Update>(
    getTransformationMutationKey(),
    async ({ id, update, ignoreMappingErrors, updateMapping }) => {
      if (updateMapping) {
        try {
          const transformation = await getTransformation(id, sdk, queryClient);

          if (!transformation) {
            throw new Error(`Transformation ${id} not found in cache`);
          }
          const q = update.query?.set || transformation.query;
          const oldMapping = getTransformationMapping(q);
          const destination =
            update.destination?.set || transformation.destination;
          const conflictMode =
            update.conflictMode?.set || transformation.conflictMode;

          const schema =
            (destination &&
              conflictMode &&
              //  oldMapping is not relevant to fetchSchema but there is not point in fetching the
              //  schema if it'll be ignored further down
              oldMapping &&
              (await fetchSchema(
                sdk,
                queryClient,
                destination,
                conflictMode
              ))) ||
            undefined;

          const newMappings =
            schema?.map(({ name }) => ({
              from: '',
              to: name,
            })) || [];
          const query =
            newMappings &&
            oldMapping &&
            getUpdateMapping(transformation, {
              ...oldMapping,
              mappings: newMappings,
            });
          update.query = query?.update.query;
        } catch (e) {
          if (!ignoreMappingErrors) {
            throw e;
          }
        }
      }
      return sdk
        .post<{ items: TransformationRead[] }>(
          getTransformationsApiUrl('/update'),
          {
            data: {
              items: [{ id, update }],
            },
          }
        )
        .then((r) => r.data.items[0]);
    },
    {
      ...options,
      onError: (e, variables, context) => {
        notification.error({
          message: t('transformation-update-error'),
          description:
            (e as CogniteError)?.status === 403
              ? t('transformation-update-error-403')
              : (e as CogniteError).errorMessage ??
                (e as Error).message?.toString(),
          key: 'transformation-update-error',
        });
        options?.onError?.(e, variables, context);
      },
      onSuccess: (item, variables, context) => {
        if (subAppPath && item?.name && item?.id)
          userHistoryService.logNewResourceEdit({
            application: subAppPath,
            name: item.name,
            path: createInternalLink(`${item.id}`),
          });
        queryClient.invalidateQueries(getTransformationListQueryKey());
        if (item) {
          // This is a bit of a belt-and-suspenders approach, the refetched transformation _should_
          // be identical to `item`
          queryClient.setQueryData(getTransformationKey(item.id), item);
          queryClient.invalidateQueries(getTransformationKey(item.id));
        }
        options?.onSuccess?.(item, variables, context);
      },
    }
  );
};

export const schemaQueryKey = (
  destination: TransformationRead['destination'],
  action: TransformationRead['conflictMode']
) => [BASE_QUERY_KEY, 'schema', destination, action];

const getSchema = async (
  sdk: CogniteClient,
  destination: TransformationRead['destination'],
  action: TransformationRead['conflictMode']
) => {
  const extraParams: Record<string, string> = {};
  let schemaType: string = destination.type;
  if (destination.type === 'sequence_rows') {
    extraParams.externalId = destination.externalId;
  } else if (destination.type === 'well_data_layer') {
    extraParams.wdlDataType = destination.wdlDataType;
  } else if (isFDMDestination(destination)) {
    // this is another inconsistency in transformations API, the schema service
    // uses the type `instance` for the resource types `nodes` and `edges`
    schemaType = 'instances';

    if (isDataModelCentric(destination)) {
      if (destination.dataModel.destinationRelationshipFromType) {
        extraParams.isConnectionDefinition = 'true';
        extraParams.instanceType = 'edges';
      } else {
        const model = await getModel(
          sdk,
          destination.dataModel.externalId,
          destination.dataModel.space,
          destination.dataModel.version
        );
        const view = model.views.find(
          ({ externalId }) =>
            externalId === destination.dataModel.destinationType
        );
        if (!view) {
          throw new Error('view not found');
        }
        extraParams.instanceType = 'nodes';
        extraParams.viewSpaceExternalId = view.space;
        extraParams.viewExternalId = view.externalId;
        extraParams.viewVersion = view.version;
      }
    } else if (isViewCentric(destination)) {
      extraParams.instanceType = destination.type;

      if (destination.view) {
        extraParams.viewSpaceExternalId = destination.view.space;
        extraParams.viewExternalId = destination.view.externalId;
        extraParams.viewVersion = destination.view.version;
      }

      if (destination.type === 'edges') {
        extraParams.isConnectionDefinition = 'true';
      }
    }
    if (destination.instanceSpace) {
      extraParams.withInstanceSpace = 'true';
    }
  }

  return sdk
    .get<SdkListData<Schema>>(
      getTransformationsApiUrl(`/schema/${schemaType}`),
      {
        params: {
          conflictMode: action,
          ...extraParams,
        },
      }
    )
    .then(({ data }) => data.items);
};

export const useSchema = (
  {
    destination,
    action,
  }: {
    destination: TransformationRead['destination'];
    action: TransformationRead['conflictMode'];
  },
  opts?: Omit<
    UseQueryOptions<Schema[], CogniteError, Schema[]>,
    'queryKey' | 'queryFn'
  >
) => {
  const sdk = useSDK();

  return useQuery<Schema[], CogniteError, Schema[]>(
    schemaQueryKey(destination, action),
    async () => await getSchema(sdk, destination, action),
    {
      refetchOnWindowFocus: false,
      ...opts,
    }
  );
};

export const fetchSchema = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  destination: TransformationRead['destination'],
  action: TransformationRead['conflictMode']
) => {
  return queryClient.fetchQuery(schemaQueryKey(destination, action), () =>
    getSchema(sdk, destination, action)
  );
};

export const WARNING_TYPES = {
  'unknown-column': 0,
  'incorrect-type': 1,
  'column-missing': 2,
} as const;

export type WarningType = keyof typeof WARNING_TYPES;
export type Warning = {
  column: string;
  type: WarningType;
  sqlType?: string;
  schemaType?: Schema['type'];
};

export const useCancelTransformation = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  const { t } = useTranslation();

  return useMutation<any, NetworkError, TransformationRead['id']>(
    (id: TransformationRead['id']) =>
      sdk.post(getTransformationsApiUrl('/cancel'), {
        data: { id },
      }),
    {
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(getTransformationListQueryKey());
        queryClient.invalidateQueries(getTransformationKey(id));
        notification.success({ message: t('job-cancelled') });
      },
      onError: (error) => {
        const { status, errorMessage, requestId } = error;
        notification.error({
          message: t('an-error-occurred'),
          description: status && (
            <>
              <p>{t('create-transformation-error-code', { code: status })}</p>
              <p>
                {t('api-error-message', {
                  error: errorMessage,
                })}
              </p>
              <p>
                {t('create-transformation-error-request-id', { requestId })}
              </p>
            </>
          ),
        });
      },
    }
  );
};

type CredentialsUpdate = {
  transformationId: number;
  sourceClientId: string;
  sourceSecret: string;
  destinationClientId: string;
  destinationSecret: string;
  setNull?: true;
  sourceProject: string;
  destinationProject?: string;
};
export const CLEAR_CREDENTIALS = {
  sourceApiKey: { setNull: true as const },
  destinationApiKey: { setNull: true as const },
  sourceOidcCredentials: { setNull: true as const },
  destinationOidcCredentials: { setNull: true as const },
  sourceNonce: { setNull: true as const },
  destinationNonce: { setNull: true as const },
};

export const useUpdateTransformationSession = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, CredentialsUpdate, unknown>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const { mutateAsync: createSession } = useCreateSession();
  const { mutateAsync: revokeSession } = useRevokeSession();
  const { mutateAsync } = useUpdateTransformation();
  const client = useQueryClient();

  const updateTransformationCredentials = async ({
    transformationId,
    sourceClientId: clientId1,
    destinationClientId: clientId2,
    sourceSecret: secret1,
    destinationSecret: secret2,
    setNull,
    sourceProject,
    destinationProject,
  }: CredentialsUpdate) => {
    const transformation = client.getQueryData<TransformationRead>(
      getTransformationKey(transformationId)
    );
    const sessionIds = [
      transformation?.sourceSession,
      transformation?.destinationSession,
    ];

    if (setNull) {
      await mutateAsync({
        id: transformationId,
        update: {
          ...CLEAR_CREDENTIALS,
        },
      });
    } else {
      const session1 = await createSession({
        credentials: {
          clientId: clientId1,
          clientSecret: secret1,
        },
        project: sourceProject,
      }).catch((e) => {
        throw new Error(`Session create error: ${e.message}`);
      });
      const session2 = await createSession({
        credentials: {
          clientId: clientId2,
          clientSecret: secret2,
        },
        project: destinationProject,
      }).catch((e) => {
        throw new Error(`Session create error: ${e.message}`);
      });
      await mutateAsync({
        id: transformationId,
        update: {
          ...CLEAR_CREDENTIALS,
          sourceNonce: {
            set: {
              nonce: session1.nonce,
              sessionId: session1.id,
              cdfProjectName: sourceProject,
            },
          },
          destinationNonce: {
            set: {
              nonce: session2.nonce,
              sessionId: session2.id,
              cdfProjectName: destinationProject,
            },
          },
        },
      });
    }

    await Promise.all(
      sessionIds.map((session) =>
        session
          ? revokeSession({
              id: session.sessionId,
              project: session.projectName,
              // not revoking sessions is not a big deal, whey will be garbage collected eventually
            }).catch(() => Promise.resolve('not revoked'))
          : Promise.resolve()
      )
    );
  };
  return useMutation(
    getTransformationCredentialsMutationKey(),
    updateTransformationCredentials,
    options
  );
};

export const useTestTransformationSession = (
  options?: Omit<
    UseMutationOptions<
      {
        session1: Session;
        session2: Session;
      },
      unknown,
      CredentialsUpdate,
      unknown
    >,
    'mutationKey' | 'mutationFn'
  >
) => {
  const { mutateAsync: createSession } = useCreateSession();

  const testTransformationCredentials = async ({
    sourceClientId: clientId1,
    destinationClientId: clientId2,
    sourceSecret: secret1,
    destinationSecret: secret2,
    sourceProject,
    destinationProject,
  }: CredentialsUpdate) => {
    const session1 = await createSession({
      credentials: {
        clientId: clientId1,
        clientSecret: secret1,
      },
      project: sourceProject,
    }).catch((e) => {
      throw new Error(`Session create error: ${e.message}`);
    });
    const session2 = await createSession({
      credentials: {
        clientId: clientId2,
        clientSecret: secret2,
      },
      project: destinationProject,
    }).catch((e) => {
      throw new Error(`Session create error: ${e.message}`);
    });
    return { session1: session1, session2: session2 };
  };
  return useMutation<
    {
      session1: Session;
      session2: Session;
    },
    unknown,
    CredentialsUpdate,
    unknown
  >(
    getTransformationCredentialsMutationKey(),
    testTransformationCredentials,
    options
  );
};

export const useTestReadTransformationSession = (
  options?: Omit<
    UseMutationOptions<
      {
        session1: Session;
      },
      unknown,
      CredentialsUpdate,
      unknown
    >,
    'mutationKey' | 'mutationFn'
  >
) => {
  const { mutateAsync: createSession } = useCreateSession();

  const testTransformationCredentials = async ({
    sourceClientId: clientId1,
    sourceSecret: secret1,
    sourceProject,
  }: CredentialsUpdate) => {
    const session1 = await createSession({
      credentials: {
        clientId: clientId1,
        clientSecret: secret1,
      },
      project: sourceProject,
    }).catch((e) => {
      throw new Error(`Session create error: ${e.message}`);
    });
    return { session1: session1 };
  };
  return useMutation<
    {
      session1: Session;
    },
    unknown,
    CredentialsUpdate,
    unknown
  >(
    getTransformationCredentialsMutationKey(),
    testTransformationCredentials,
    options
  );
};

export const useTestWriteTransformationSession = (
  options?: Omit<
    UseMutationOptions<
      {
        session2: Session;
      },
      unknown,
      CredentialsUpdate,
      unknown
    >,
    'mutationKey' | 'mutationFn'
  >
) => {
  const { mutateAsync: createSession } = useCreateSession();

  const testTransformationCredentials = async ({
    destinationClientId: clientId2,
    destinationSecret: secret2,
    destinationProject,
  }: CredentialsUpdate) => {
    const session2 = await createSession({
      credentials: {
        clientId: clientId2,
        clientSecret: secret2,
      },
      project: destinationProject,
    }).catch((e) => {
      throw new Error(`Session create error: ${e.message}`);
    });
    return { session2: session2 };
  };
  return useMutation<
    {
      session2: Session;
    },
    unknown,
    CredentialsUpdate,
    unknown
  >(
    getTransformationCredentialsMutationKey(),
    testTransformationCredentials,
    options
  );
};

type ApiKeyUpdate = {
  transformationId: number;
  sourceApiKey: string;
  destinationApiKey: string;
  setNull?: boolean;
};
export const useUpdateTransformationApiKey = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, ApiKeyUpdate, unknown>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const { mutateAsync } = useUpdateTransformation();

  const updateTransformation = async ({
    transformationId,
    destinationApiKey,
    sourceApiKey,
    setNull,
  }: ApiKeyUpdate) => {
    if (setNull) {
      return mutateAsync({
        id: transformationId,
        update: {
          ...CLEAR_CREDENTIALS,
        },
      });
    } else {
      return mutateAsync({
        id: transformationId,
        update: {
          ...CLEAR_CREDENTIALS,
          destinationApiKey: {
            set: destinationApiKey,
          },
          sourceApiKey: {
            set: sourceApiKey,
          },
        },
      });
    }
  };
  return useMutation(
    getTransformationCredentialsMutationKey(),
    updateTransformation,
    options
  );
};
