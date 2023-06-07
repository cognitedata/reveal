import { createAsyncThunk } from '@reduxjs/toolkit';
import { callUntilCompleted } from 'helpers/Helpers';
import { trackTimedUsage, PNID_METRICS, trackUsage } from 'utils/Metrics';
import { FileUploadResponse } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import GCSUploader from 'components/GCSUploader';
import { Vertices } from 'modules/types';
import {
  convertErrorNotification,
  convertSuccessNotification,
} from 'pages/PageResultsOverview/utils';
import handleError, { tryToStringify } from 'utils/handleError';
import { createJob, updateJob, rejectJob, finishJob, downloadFile } from '.';
// ---------------------------

const apiRootPath = (project: string) =>
  `/api/playground/projects/${project}/context/diagram`;
const createConvertJobPath = (project: string) =>
  `${apiRootPath(project)}/convert`;
const createConvertStatusPath = (project: string, jobid: number) =>
  `${apiRootPath(project)}/convert/${jobid}`;

export type DiagramToConvert = {
  fileId: number;
  fileName?: string;
  assetIds: number[];
  annotations: {
    text: string;
    region: {
      shape: string;
      vertices: Vertices;
    };
    confidence?: number;
  }[];
};

export const startConvertFileToSvgJob = {
  action: createAsyncThunk(
    'workflow/startConvertDiagramToSvgJob',
    async (
      { diagrams, prefix }: { diagrams: DiagramToConvert[]; prefix?: string },
      { dispatch }: { dispatch: any }
    ) => {
      const convertedDiagramExampleId = diagrams[0]?.fileId;
      const fileIds = diagrams.map((d) => d.fileId);
      if (!convertedDiagramExampleId) {
        Promise.reject();
        return;
      }

      try {
        const response = await sdk.post(createConvertJobPath(sdk.project), {
          data: {
            items: diagrams.map((d) => ({
              fileId: d.fileId,
              annotations: d.annotations,
            })), // diagrams need to be parsed with labels etc
          },
        });
        const {
          status: httpStatus,
          data: { jobId, status, error, errorMessage },
        } = response;
        trackUsage(PNID_METRICS.convertingJob.start, {
          jobId,
        });
        const timer = trackTimedUsage(PNID_METRICS.convertingJob.time, {
          jobId,
        });
        dispatch(createJob({ fileIds, jobId }));
        dispatch(updateJob({ jobId, status }));

        if (httpStatus !== 200) {
          convertErrorNotification(
            errorMessage ??
              error.message ??
              'Something went wrong. Please try again'
          );
          dispatch(rejectJob({ jobId }));
          timer.stop({ success: false, jobId });
          Promise.reject();
          return;
        }
        callUntilCompleted(
          () => sdk.get(createConvertStatusPath(sdk.project, jobId)),
          (data) => data.status === 'Completed' || data.status === 'Failed',
          async (data) => {
            const {
              errorMessage: scopedErrorMessage,
              status: newStatus,
              items,
            } = data;
            if (newStatus === 'Failed') {
              convertErrorNotification(scopedErrorMessage);
              dispatch(rejectJob({ jobId, job: data }));
              Promise.reject();
              return;
            }
            const svgIds: { fileId: number; svgId: number }[] = [];
            try {
              await Promise.all(
                items.map(async (svgData: any) => {
                  // [todo] handle multipage pdfs, this saves only 1st page
                  const svg = await downloadFile(svgData.results?.[0]?.svgUrl);
                  const {
                    fileId,
                    fileName = '',
                    assetIds,
                  }: DiagramToConvert = diagrams.find(
                    (d) => d.fileId === svgData.fileId
                  )!;
                  const newName =
                    fileName.lastIndexOf('.') !== 0
                      ? fileName.substr(0, fileName.lastIndexOf('.'))
                      : fileName;
                  try {
                    // if this file already had an SVG created from it,
                    // its name cannot be changed unless file is recreated from scratch.
                    // https://cognitedata.slack.com/archives/C85QG3UBU/p1631263010036300
                    await sdk.files.delete([
                      { externalId: `processed-${fileId}` },
                    ]);
                  } catch (_e) {
                    // it's easier to silently catch an error when file to delete does not exist
                    // than checking if it does beforehand
                  }
                  const newFile = await sdk.files.upload(
                    {
                      externalId: `processed-${fileId}`,
                      name: prefix
                        ? `${prefix}_${newName}.svg`
                        : `${newName}.svg`,
                      mimeType: 'image/svg+xml',
                      assetIds,
                      metadata: {
                        original_file_id: `${fileId}`,
                      },
                    },
                    undefined,
                    true
                  );
                  svgIds.push({ fileId, svgId: newFile.id });
                  const uploader = await GCSUploader(
                    svg,
                    (newFile as FileUploadResponse).uploadUrl!
                  );
                  await uploader.start();
                })
              );

              await dispatch(finishJob({ job: { ...data, svgIds } }));
              convertSuccessNotification(data);
              Promise.resolve(jobId);
              timer.stop({ success: true, jobId });
            } catch (e) {
              convertErrorNotification(tryToStringify({ ...e }));
              dispatch(rejectJob({ jobId }));
              Promise.reject();
              timer.stop({ success: false, jobId });
            }
          },
          (data) => {
            // failed files show as success for a few seconds if this check is not here
            if (data.status !== 'Completed' && data.status !== 'Failed')
              dispatch(updateJob({ jobId, status: data.status }));
          },
          (e) => {
            handleError({
              status: e.status,
              message: e.message ?? e,
              errorMessage: e.errorMessage ?? e.message ?? e,
            });
            dispatch(rejectJob({ jobId, status: 'Failed', errorMessage: e }));
          },
          3000
        );
      } catch (e) {
        handleError({ ...e });
      }
    }
  ),
  rejected: () => {},
};
