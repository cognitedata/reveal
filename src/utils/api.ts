import sdk from 'sdk-singleton';
import { QueryKey } from 'react-query';
import { CreateSchedule, CogFunctionUpload, CogFunction } from 'types';
import { FileUploadResponse } from '@cognite/cdf-sdk-singleton';
import { UploadFile } from 'antd/lib/upload/interface';
import UploadGCS from '@cognite/gcs-browser-upload';

type _GetCallsArgs = { id: number; scheduleId?: number };
type GetCallsArgs = _GetCallsArgs | _GetCallsArgs;

const getCallsSdk = (args: _GetCallsArgs) => {
  const { id, scheduleId } = args;
  const filter = args ? { scheduleId } : {};
  return sdk
    .post(
      `/api/playground/projects/${sdk.project}/functions/${id}/calls/list`,
      {
        data: { filter },
      }
    )
    .then(response => response.data?.items);
};

export const getCalls = async (_: QueryKey, args: GetCallsArgs) => {
  if (Array.isArray(args)) {
    const results = await Promise.all(args.map(a => getCallsSdk(a)));
    return args.reduce(
      (accl, { id }, index) => ({
        ...accl,
        [id]: results[index],
      }),
      {}
    );
  }
  return getCallsSdk(args);
};

type GetCallArgs = {
  id: number;
  callId: number;
};
export const getCall = (_: QueryKey, args: GetCallArgs) => {
  const { id, callId } = args;
  return sdk
    .get(
      `/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}`
    )
    .then(response => response.data);
};

type CallArgs = {
  id: number;
  data: any;
};
export const callFunction = async ({ id, data }: CallArgs) => {
  return sdk
    .post(`/api/playground/projects/${sdk.project}/functions/${id}/call`, {
      data: data || {},
    })
    .then(response => response?.data);
};

type GetResponseArgs = {
  id: number;
  callId: number;
};
export const getResponse = async (
  _: QueryKey,
  { id, callId }: GetResponseArgs
) => {
  return sdk
    .get(
      `/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}/response`
    )
    .then(response => response?.data);
};

export const getLogs = async (_: QueryKey, { id, callId }: GetResponseArgs) => {
  return sdk
    .get(
      `/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}/logs`
    )
    .then(response => response?.data);
};

export const deleteFunction = ({ id }: { id: number }) =>
  sdk
    .post(`/api/playground/projects/${sdk.project}/functions/delete`, {
      data: { items: [{ id }] },
    })
    .then(response => response?.data);

export const createSchedule = (schedule: CreateSchedule) =>
  sdk
    .post(`/api/playground/projects/${sdk.project}/functions/schedules`, {
      data: { items: [schedule] },
    })
    .then(response => response?.data);

export const deleteSchedule = (id: number) =>
  sdk
    .post(
      `/api/playground/projects/${sdk.project}/functions/schedules/delete`,
      {
        data: { items: [{ id }] },
      }
    )
    .then(response => response?.data);

const sleep = async (ms: number) =>
  new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });

const createFunction = async (
  cogfunction: CogFunctionUpload
): Promise<CogFunction> => {
  return await sdk
    .post(`/api/playground/projects/${sdk.project}/functions`, {
      data: { items: [cogfunction] },
    })
    .then(response => response?.data);
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
  if (!uploadUrl || !id) {
    return Promise.reject('upload-error');
  }

  const currentUpload = await GCSUploader(file, uploadUrl, (info: any) => {
    file.response = info;
    file.percent = (info.uploadedBytes / info.totalBytes) * 100;
  });

  await currentUpload.start();

  return id;
};

export const deleteFile = sdk.files.delete;

export const uploadFunction = async ({
  data,
  file,
}: {
  data: Omit<CogFunctionUpload, 'fileId'>;
  file: UploadFile;
}) => {
  const fileId = await uploadFile(file);
  // The function api will sometimes claim that a file id doesn't
  // exist right after the upload completes.
  await sleep(1000);
  try {
    const { id } = await createFunction({ ...data, fileId });
    return id;
  } catch (e) {
    await deleteFile([{ id: fileId }]);
    throw e;
  }
};
