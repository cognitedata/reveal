import '__mocks/mockContainerAuth'; // never miss this import
import { act } from 'react-test-renderer';

import { setupServer } from 'msw/node';

import { ProjectConfig } from '@cognite/discover-api-types';

import { getMockConfig } from '__test-utils/fixtures/projectConfig';
import { renderHookWithStore } from '__test-utils/renderer';

import { getMockConfigDelete } from '../__mocks/getMockConfigDelete';
import { getMockConfigGet } from '../__mocks/getMockConfigGet';
import { getMockConfigMetadataGet } from '../__mocks/getMockConfigMetadataGet';
import { getMockConfigPatch } from '../__mocks/getMockConfigPatch';
import {
  useProjectConfigDeleteQuery,
  useProjectConfigMetadataGetQuery,
  useProjectConfigUpdateMutate,
} from '../useProjectConfigQuery';

const responseData: ProjectConfig = getMockConfig();

const initiateTest = async (hook: any, parameter?: unknown) => {
  const { result, waitForNextUpdate } = renderHookWithStore(() =>
    hook(parameter)
  );
  return { result, waitForNextUpdate };
};

const originalConsole = global.console;

describe('useProjectConfigUpdateMutate', () => {
  const mockServer = setupServer(getMockConfigGet(), getMockConfigPatch(200));
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    jest.clearAllMocks();
    mockServer.close();
  });

  it('should return valid results and not fail', async () => {
    const { result } = await initiateTest(useProjectConfigUpdateMutate, {
      onSuccess,
      onError,
    });

    await act(() =>
      result.current.mutateAsync({}).then((response: unknown) => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(0);
        expect(response).toEqual(responseData);
      })
    );
  });
});

describe('useProjectConfigUpdateMutate fail', () => {
  const mockServer = setupServer(getMockConfigPatch(400));
  const onSuccess = jest.fn();
  const onError = jest.fn();
  const error = jest.fn();

  beforeAll(() => {
    mockServer.listen();
    // @ts-expect-error - missing other keys
    global.console = { error };
  });
  afterAll(() => {
    jest.clearAllMocks();
    mockServer.close();
    global.console = originalConsole;
  });

  it('should call the error function', async () => {
    const { result } = await initiateTest(useProjectConfigUpdateMutate, {
      onSuccess,
      onError,
    });

    await act(() => {
      return result.current.mutateAsync({}).catch((_error: unknown) => {
        // console.log(error);
      });
    });
    expect(onSuccess).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
  });
});

describe('useProjectConfigMetadataGetQuery', () => {
  const mockServer = setupServer(getMockConfigMetadataGet());

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected respond', async () => {
    const { result, waitForNextUpdate } = await initiateTest(
      useProjectConfigMetadataGetQuery
    );
    await waitForNextUpdate();
    expect(result.current.data).toEqual(responseData);
  });
});

describe('useProjectConfigDeleteQuery', () => {
  const mockServer = setupServer(getMockConfigDelete());

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return success respond', async () => {
    const { result } = await initiateTest(useProjectConfigDeleteQuery);

    await act(() =>
      result.current.mutateAsync().then((response: unknown) => {
        expect(response).toEqual(responseData);
      })
    );
  });
});
