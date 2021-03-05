/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    project: 'testing',
    post: jest.fn(),
    get: jest.fn(),
    files: {
      upload: jest.fn(),
    },
  };
});

import { Map } from 'immutable';
import { mockStore } from 'utils/mockStore';
import { summarizeAssetIdsFromAnnotations } from '@cognite/annotations';
import sdk from 'sdk-singleton';
import * as UploadJobs from './uploadJobs';

jest.mock('@cognite/annotations');
// used in uploadFile() to mock return value of GCSUploader()
jest.mock('@cognite/gcs-browser-upload');

describe('UploadJobs store', () => {
  describe('uploadJobsReducer', () => {
    it(`${UploadJobs.stuffForUnitTests.UPLOAD_JOB_CREATED}`, () => {
      const initialState: UploadJobs.UploadJobsStore = {
        ...UploadJobs.stuffForUnitTests.initialPnIDState,
      };
      const outputState = UploadJobs.uploadJobsReducer(initialState, {
        // @ts-ignore
        type: UploadJobs.stuffForUnitTests.UPLOAD_JOB_CREATED,
        fileId: 1,
        jobId: 123,
      });
      expect(outputState[1].jobId).toStrictEqual(123);
    });

    it(`${UploadJobs.stuffForUnitTests.UPLOAD_JOB_CREATE_STARTED}`, () => {
      const initialState: UploadJobs.UploadJobsStore = {
        ...UploadJobs.stuffForUnitTests.initialPnIDState,
      };
      const outputState = UploadJobs.uploadJobsReducer(initialState, {
        // @ts-ignore
        type: UploadJobs.stuffForUnitTests.UPLOAD_JOB_CREATE_STARTED,
        fileId: 1,
      });
      expect(outputState[1].jobStatus).toStrictEqual('Queued');
    });
    it(`${UploadJobs.stuffForUnitTests.UPLOAD_JOB_STATUS_UPDATED}`, () => {
      const initialState: UploadJobs.UploadJobsStore = {
        ...UploadJobs.stuffForUnitTests.initialPnIDState,
      };
      const outputState = UploadJobs.uploadJobsReducer(initialState, {
        // @ts-ignore
        type: UploadJobs.stuffForUnitTests.UPLOAD_JOB_STATUS_UPDATED,
        fileId: 1,
        status: 'Failed',
      });
      expect(outputState[1].jobStatus).toStrictEqual('Failed');
    });
    it(`${UploadJobs.stuffForUnitTests.UPLOAD_JOB_DONE}`, () => {
      const initialState: UploadJobs.UploadJobsStore = {
        ...UploadJobs.stuffForUnitTests.initialPnIDState,
      };
      const outputState = UploadJobs.uploadJobsReducer(initialState, {
        // @ts-ignore
        type: UploadJobs.stuffForUnitTests.UPLOAD_JOB_DONE,
        fileId: 1,
        svgUrl: '12312312',
      });
      expect(outputState[1].svgUrl).toStrictEqual('12312312');
    });
    it(`${UploadJobs.stuffForUnitTests.UPLOAD_JOB_ERROR}`, () => {
      const initialState: UploadJobs.UploadJobsStore = {
        ...UploadJobs.stuffForUnitTests.initialPnIDState,
      };
      const outputState = UploadJobs.uploadJobsReducer(initialState, {
        // @ts-ignore
        type: UploadJobs.stuffForUnitTests.UPLOAD_JOB_ERROR,
        fileId: 1,
      });
      expect(outputState[1].jobError).toStrictEqual(true);
    });
  });

  describe('actions', () => {
    describe('convertToSvg', () => {
      sdk.post.mockResolvedValue({
        status: 200,
        data: { jobId: 123, status: 'Queued', svgUrl: '123123' },
      });
      sdk.post.mockClear();
      sdk.get.mockResolvedValue({
        status: 200,
        data: { jobId: 123, status: 'Completed', svgUrl: '123123' },
      });
      sdk.get.mockClear();
      sdk.files.upload.mockReturnValue({ uploadUrl: 'hello' });
      sdk.files.upload.mockClear();

      it('everything went correctly', async () => {
        summarizeAssetIdsFromAnnotations.mockReturnValue([{ assetIds: [] }]);
        jest
          .spyOn(UploadJobs, 'downloadFile')
          .mockResolvedValue('testingValue');

        const initialStore = {
          fileContextualization: {
            uploadJobs: {
              ...UploadJobs.stuffForUnitTests.initialPnIDState,
            },
            pnidOption: {
              grayscale: false,
            },
          },
          files: {
            items: {
              getById: { 1: { done: true, item: 1 } },
              items: Map([[1, { name: '123.pdf' }]]),
            },
          },
          app: { loaded: false, groups: {} },
        };
        // @ts-ignore
        const store = mockStore(initialStore);
        await store.dispatch(UploadJobs.startConvertFileToSvgJob(1, []));
        expect(store.getActions().length).toEqual(6);
      });
      it('empty annotations', async () => {
        summarizeAssetIdsFromAnnotations.mockReturnValue([]);
        jest
          .spyOn(UploadJobs, 'downloadFile')
          .mockResolvedValue('testingValue');

        const initialStore = {
          fileContextualization: {
            uploadJobs: {
              ...UploadJobs.stuffForUnitTests.initialPnIDState,
            },
            pnidOption: {
              grayscale: false,
            },
          },
          files: {
            items: {
              getById: { 1: { done: true, item: 1 } },
              items: Map([[1, { name: '123.pdf' }]]),
            },
          },
          annotations: { byFileId: { 1: { annotations: [] } } },
          app: { loaded: false, groups: {} },
        };
        // @ts-ignore
        const store = mockStore(initialStore);
        await store.dispatch(UploadJobs.startConvertFileToSvgJob(1, []));
        expect(store.getActions().length).toEqual(6);
      });
      it('invalid conversion of file', async () => {
        summarizeAssetIdsFromAnnotations.mockReturnValue([]);
        jest
          .spyOn(UploadJobs, 'downloadFile')
          .mockRejectedValue('testingValue');
        const initialStore = {
          fileContextualization: {
            uploadJobs: {
              ...UploadJobs.stuffForUnitTests.initialPnIDState,
            },
            pnidOption: {
              grayscale: false,
            },
          },
          files: {
            items: {
              getById: { 1: { done: true, item: 1 } },
              items: Map([
                [
                  1,
                  {
                    name: '123.pdf',
                  },
                ],
              ]),
            },
          },
          app: { loaded: false, groups: {} },
        };
        // @ts-ignore

        const store = mockStore(initialStore);
        await expect(
          store.dispatch(UploadJobs.startConvertFileToSvgJob(1, []))
        ).rejects.toEqual(undefined);
      });
    });
  });
});
