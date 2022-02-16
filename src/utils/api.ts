import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import { QueryKey } from 'react-query';
import {
  CogFunctionUpload,
  CogFunction,
  GetCallArgs,
  CallResponse,
  GetCallsArgs,
  Call,
  CreateScheduleApiParams,
} from 'types';
import { FileUploadResponse } from '@cognite/sdk';
import { UploadFile } from 'antd/lib/upload/interface';
import UploadGCS from '@cognite/gcs-browser-upload';
import { getProject } from '@cognite/cdf-utilities';
import { sleep } from 'helpers';
import { newestCall } from './sorting';

// Using react-query#useQuery calls the function with a QueryKey as the first
// argument, useMutation does not.

const getCallsSdk = ({ id, scheduleId }: GetCallsArgs): Promise<Call[]> => {
  if (!id) {
    throw new Error('id missing');
  }
  const filter = scheduleId ? { scheduleId } : {};
  return sdk
    .post(
      `/api/playground/projects/${getProject()}/functions/${id}/calls/list`,
      {
        data: { filter },
      }
    )
    .then(response => response.data?.items);
};

export const getCalls = async (_: QueryKey, args: GetCallsArgs) => {
  return getCallsSdk(args);
};

export const getLatestCalls = async (_: QueryKey, args: GetCallsArgs[]) => {
  const requests = args.map(a => getCallsSdk(a));
  const results = await Promise.all(requests);
  return args.reduce(
    (accl, { id }, index) => ({
      ...accl,
      [id]: results[index].sort(newestCall)[0],
    }),
    {}
  );
};

export const getCall = (_: QueryKey, { id, callId }: GetCallArgs) => {
  if (!id) {
    throw new Error('id missing');
  }
  if (!callId) {
    throw new Error('callId missing');
  }
  return sdk
    .get(
      `/api/playground/projects/${getProject()}/functions/${id}/calls/${callId}`
    )
    .then(response => response.data);
};

type GetResponseArgs = {
  id: number;
  callId: number;
};
export const getResponse = (_: QueryKey, { id, callId }: GetResponseArgs) => {
  if (!id) {
    throw new Error('id missing');
  }
  if (!callId) {
    throw new Error('callId missing');
  }
  return sdk
    .get(
      `/api/playground/projects/${getProject()}/functions/${id}/calls/${callId}/response`
    )
    .then(response => response?.data?.response);
};

export const getLogs = (_: QueryKey, { id, callId }: GetResponseArgs) => {
  if (!id) {
    throw new Error('id missing');
  }
  if (!callId) {
    throw new Error('callId missing');
  }
  return sdk
    .get(
      `/api/playground/projects/${getProject()}/functions/${id}/calls/${callId}/logs`
    )
    .then(response => response?.data?.items);
};

export const createFunctionCall = async ({
  id,
  data,
  isOIDC,
}: {
  id: number;
  data: any;
  isOIDC?: boolean;
}): Promise<CallResponse> => {
  if (!id) {
    throw new Error('id missing');
  }

  const { nonce } = isOIDC && (await createSession());
  return sdk
    .post(`/api/playground/projects/${getProject()}/functions/${id}/call`, {
      data: { data: data || {}, nonce },
    })
    .then(response => response?.data);
};

export const createSchedule = async ({
  schedule,
  clientCredentials,
}: CreateScheduleApiParams) => {
  const { nonce } =
    !!clientCredentials && (await createSession(clientCredentials));
  return sdk
    .post(`/api/playground/projects/${getProject()}/functions/schedules`, {
      data: { items: [{ ...schedule, nonce }] },
    })
    .then(response => response?.data);
};

export const deleteSchedule = (id: number) =>
  sdk
    .post(
      `/api/playground/projects/${getProject()}/functions/schedules/delete`,
      {
        data: { items: [{ id }] },
      }
    )
    .then(response => response?.data);

const createFunction = (
  cogfunction: CogFunctionUpload
): Promise<CogFunction> => {
  return sdk
    .post(`/api/playground/projects/${getProject()}/functions`, {
      data: { items: [cogfunction] },
    })
    .then(response => response?.data);
};
export const deleteFunction = async ({
  id,
  fileId,
}: {
  id: number;
  fileId?: number;
}) => {
  if (!id) {
    throw new Error('id missing');
  }
  const deleteResponse = await sdk
    .post(`/api/playground/projects/${getProject()}/functions/delete`, {
      data: { items: [{ id }] },
    })
    .then(response => response?.data);
  if (fileId) {
    await sdk.files.delete([{ id: fileId }]);
  }
  return deleteResponse;
};

const GCSUploader = (
  file: Blob | UploadFile,
  uploadUrl: string,
  callback: (info: any) => void = () => {}
) => {
  // This is what is recommended from google when uploading files.
  // https://github.com/QubitProducts/gcs-browser-upload
  const chunkMultiple = Math.min(
    Math.max(
      2, // 0.5MB min chunks
      Math.ceil((file.size / 20) * 262144) // will divide into 20 segments
    ),
    200 // 50 MB max
  );

  return new UploadGCS({
    id: 'datastudio-upload',
    url: uploadUrl,
    file,
    chunkSize: 262144 * chunkMultiple,
    onChunkUpload: callback,
  });
};

const uploadFile = async (file: UploadFile) => {
  const { uploadUrl, id } = (await sdk.files.upload({
    name: file.name,
    source: 'Datastudio',
  })) as FileUploadResponse;
  if (!uploadUrl) {
    throw new Error('Upload error, did not recieve "uploadUrl"');
  }
  if (!id) {
    throw new Error('Upload error, did not recieve "id"');
  }

  const currentUpload = await GCSUploader(file, uploadUrl, (info: any) => {
    file.response = info;
    file.percent = (info.uploadedBytes / info.totalBytes) * 100;
  });

  await currentUpload.start();

  let fileInfo = await sdk.files.retrieve([{ id }]).then(r => r[0]);
  let retries = 0;
  while (!fileInfo.uploaded && retries <= 10) {
    retries += 1;
    /* eslint-disable no-await-in-loop */
    await sleep(retries * 1000);
    fileInfo = await sdk.files.retrieve([{ id }]).then(r => r[0]);
  }

  if (!fileInfo.uploaded) {
    return Promise.reject(fileInfo.id);
  }

  return id;
};

export const uploadFunction = async ({
  data,
  file,
}: {
  data: Omit<CogFunctionUpload, 'fileId'>;
  file: UploadFile;
}) => {
  const fileId = await uploadFile(file);
  try {
    const { id } = await createFunction({ ...data, fileId });
    return id;
  } catch (e) {
    await sdk.files.delete([{ id: fileId }]);
    throw e;
  }
};

export const createSession = (clientCredentials?: {
  clientId: string;
  clientSecret: string;
}) => {
  return sdk
    .post(`/api/v1/projects/${getProject()}/sessions`, {
      data: {
        items: [clientCredentials || { tokenExchange: true }],
      },
    })
    .then(response => response?.data.items[0]);
};

export const isOIDCFlow = () => {
  const { flow } = getFlow();
  return flow !== 'COGNITE_AUTH';
};
