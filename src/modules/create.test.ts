/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    project: 'testProject',
    post: jest.fn(),
    files: {
      upload: jest.fn(),
    },
  };
});

import { UploadFile } from 'antd/lib/upload/interface';

import UploadGCS from '@cognite/gcs-browser-upload';
import sdk from 'sdk-singleton';
import reducer, {
  createFunctionReset,
  uploadFile,
  createFunction,
  stuffForUnitTests,
} from './create';

// used in uploadFile() to mock return value of GCSUploader()
jest.mock('@cognite/gcs-browser-upload');
UploadGCS.mockImplementation(() => {
  return {
    start: jest.fn(),
  };
});

const mockProject = 'testProject';
const mockFunctionName = 'testFunc';
const mockFunctionDescription = 'someFuncDescription';
const mockFunctionApiKey = 'secretCogniteApiKey';
const mockFunctionOwner = 'human@cognite.com';
const mockFile = ('a file' as unknown) as UploadFile;
const mockExternalId = 'externalid';
const mockSecrets = { key: 'value' };
const mockErrorMessage = 'errorMessage';

describe('function create module', () => {
  describe('actions', () => {
    describe('uploadFile', () => {
      sdk.files.upload.mockReturnValue({ uploadUrl: 'upload.com', id: 1 });
      sdk.files.upload.mockClear();
      it('should dispatch appropriate actions', async () => {
        const store = {
          functions: { create: { fileInfo: {} } },
        };
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        stuffForUnitTests.GCSUploader = jest
          .fn()
          .mockReturnValue(new UploadGCS());
        const thunk = uploadFile(mockFile);
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/UPLOAD_FILE',
          file: mockFile,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/UPLOAD_FILE_DONE',
          fileId: 1,
        });
      });
      it('should call the cognite files api', async () => {
        sdk.files.upload.mockReturnValue({ uploadUrl: 'upload.com', id: 1 });
        sdk.files.upload.mockClear();
        const store = {
          functions: { create: { fileInfo: {} } },
        };
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = uploadFile(mockFile);
        await thunk(dispatch, getState);
        expect(sdk.files.upload.mock.calls.length).toBe(1);
        expect(sdk.files.upload).toHaveBeenNthCalledWith(1, {
          name: undefined,
          source: 'Datastudio',
        });
      });
    });
    describe('createFunction', () => {
      sdk.post.mockReturnValue({ status: 201 });
      it('should throw an error if there is no fileId set', async () => {
        const store = {
          functions: { create: { fileInfo: {} } },
        };
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = createFunction(
          mockFunctionName,
          mockFunctionDescription,
          mockFunctionApiKey,
          mockFunctionOwner,
          mockExternalId,
          mockSecrets
        );
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(1);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/CREATE_ERROR',
          functionName: mockFunctionName,
          errorMessage: 'Unable to find file',
        });
      });
      it('should throw an error if there there is an error with the API call', async () => {
        sdk.post.mockReturnValue({ status: 500 });
        sdk.post.mockClear();
        const store = {
          functions: { create: { fileInfo: { fileId: 1 } } },
        };
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = createFunction(
          mockFunctionName,
          mockFunctionDescription,
          mockFunctionApiKey,
          mockFunctionOwner,
          mockExternalId,
          mockSecrets
        );
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/CREATE',
          functionName: mockFunctionName,
          apiKey: mockFunctionApiKey,
          description: mockFunctionDescription,
          owner: mockFunctionOwner,
          externalId: mockExternalId,
          secrets: mockSecrets,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/CREATE_ERROR',
          functionName: mockFunctionName,
          errorMessage: 'Unable to create function',
        });
      });
      it('should dispatch appropriate actions', async () => {
        sdk.post.mockReturnValue({ status: 201 });
        const store = {
          functions: { create: { fileInfo: { fileId: 1 } } },
        };
        const dispatch = jest.fn().mockReturnValue(true);
        const getState = jest.fn().mockReturnValue(store);
        const thunk = createFunction(
          mockFunctionName,
          mockFunctionDescription,
          mockFunctionApiKey,
          mockFunctionOwner,
          mockExternalId,
          mockSecrets
        );
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(4);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/CREATE',
          functionName: mockFunctionName,
          apiKey: mockFunctionApiKey,
          description: mockFunctionDescription,
          owner: mockFunctionOwner,
          externalId: mockExternalId,
          secrets: mockSecrets,
        });
        // 2nd call is to loadFunctions()
        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: 'functions/CREATE_DONE',
          functionName: mockFunctionName,
        });
        // 4th call is to callUntilCompleted()
      });
      it('should call the datastudio api', async () => {
        sdk.post.mockReturnValue({ status: 201 });
        sdk.post.mockReset();
        const store = {
          functions: { create: { fileInfo: { fileId: 1 } } },
        };
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = createFunction(
          mockFunctionName,
          mockFunctionDescription,
          mockFunctionApiKey,
          mockFunctionOwner,
          mockExternalId,
          mockSecrets
        );
        await thunk(dispatch, getState);
        expect(sdk.post.mock.calls.length).toBe(1);
        expect(sdk.post).toHaveBeenNthCalledWith(
          1,
          `/api/playground/projects/${mockProject}/functions`,
          {
            data: {
              items: [
                {
                  name: mockFunctionName,
                  fileId: 1,
                  apiKey: mockFunctionApiKey,
                  description: mockFunctionDescription,
                  owner: mockFunctionOwner,
                  externalId: mockExternalId,
                  secrets: mockSecrets,
                },
              ],
            },
          }
        );
      });
    });
    describe('createFunctionReset', () => {
      it('should dispatch appropriate actions', async () => {
        const dispatch = jest.fn();
        const thunk = createFunctionReset();
        await thunk(dispatch);
        expect(dispatch).toBeCalledTimes(1);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/CREATE_RESET',
        });
      });
    });
  });
  describe('reducer', () => {
    describe('imutability', () => {
      it('it should not mutate the old state, but return the new', () => {
        const initialState = reducer(undefined, {
          type: 'functions/CREATE',
          functionName: mockFunctionName,
          apiKey: mockFunctionApiKey,
          description: mockFunctionDescription,
          owner: mockFunctionOwner,
          externalId: mockExternalId,
          secrets: mockSecrets,
        });
        const state1 = reducer(initialState, {
          type: 'functions/CREATE_DONE',
          functionName: mockFunctionName,
        });
        expect(initialState).not.toBe(state1);
      });
    });
  });
  describe('ACTIONS', () => {
    const initialState = reducer(undefined, { type: 'INIT' });
    describe('create actions', () => {
      const inProgressUploadFileState = {
        fileInfo: {
          file: mockFile,
          uploading: true,
        },
      };
      const inProgressCreateFunctionState = {
        name: mockFunctionName,
        description: mockFunctionDescription,
        apiKey: mockFunctionApiKey,
        owner: mockFunctionOwner,
        fileInfo: {
          file: mockFile,
          uploading: false,
          done: true,
        },
        creating: true,
      };

      describe('functions/UPLOAD_FILE', () => {
        const newState = reducer(initialState, {
          type: 'functions/UPLOAD_FILE',
          file: mockFile,
        });
        it('should set the `uploading` flag to true', () => {
          expect(newState.fileInfo.uploading).toBe(true);
        });
        it('should set the `file` field with the file to upload', () => {
          expect(newState.fileInfo.file).toBe(mockFile);
        });
      });
      describe('functions/UPLOAD_FILE_DONE', () => {
        const newState = reducer(inProgressUploadFileState, {
          type: 'functions/UPLOAD_FILE_DONE',
          fileId: 1,
        });
        it('should set the `done` flag to true', () => {
          expect(newState.fileInfo.done).toBe(true);
        });
        it('should set the `uploading` flag to false', () => {
          expect(newState.fileInfo.uploading).toBe(false);
        });
        it('should set the `fileId` field to be the fileId returned by the apiCall', () => {
          expect(newState.fileInfo.fileId).toBe(1);
        });
      });
      describe('functions/UPLOAD_FILE_ERROR', () => {
        const newState = reducer(inProgressUploadFileState, {
          type: 'functions/UPLOAD_FILE_ERROR',
          file: mockFile,
        });
        it('should set the `error` flag to true', () => {
          expect(newState.fileInfo.error).toBe(true);
        });
        it('should set the `uploading` flag to false', () => {
          expect(newState.fileInfo.uploading).toBe(false);
        });
      });
      describe('functions/CREATE', () => {
        it('should set the `creating` flag to true', () => {
          const newState = reducer(initialState, {
            type: 'functions/CREATE',
            functionName: mockFunctionName,
            description: mockFunctionDescription,
            apiKey: mockFunctionApiKey,
            owner: mockFunctionOwner,
            externalId: mockExternalId,
            secrets: mockSecrets,
          });
          expect(newState.creating).toBe(true);
        });
      });
      describe('functions/CREATE_DONE', () => {
        const newState = reducer(inProgressCreateFunctionState, {
          type: 'functions/CREATE_DONE',
          functionName: mockFunctionName,
        });
        it('should set the `done` flag to true', () => {
          expect(newState.done).toBe(true);
        });
        it('should set the `creating` flag to false', () => {
          expect(newState.creating).toBe(false);
        });
      });
      describe('functions/CREATE_ERROR', () => {
        const newState = reducer(undefined, {
          type: 'functions/CREATE_ERROR',
          functionName: mockFunctionName,
          errorMessage: mockErrorMessage,
        });
        it('should set the `error` flag to true', () => {
          expect(newState.error).toBe(true);
        });
        it('should set the `creating` flag to false', () => {
          expect(newState.creating).toBe(false);
        });
        it('should set the `errorMessage` field to the provided string', () => {
          expect(newState.errorMessage).toBe(mockErrorMessage);
        });
      });
      describe('functions/CREATE_RESET', () => {
        it('should reset the create field', () => {
          const newState = reducer(inProgressCreateFunctionState, {
            type: 'functions/CREATE_RESET',
          });
          expect(newState.fileInfo).toEqual({});
          expect(newState).toEqual({ fileInfo: {} });
        });
      });
    });
  });
});
