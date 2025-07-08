import { describe, expect, test, assert, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { useModelIdRevisionIdFromModelOptions } from './useModelIdRevisionIdFromModelOptions';
import {
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultModelIdRevisionIdFromModelOptionsDependencies,
  ModelIdRevisionIdFromModelOptionsContext
} from './useModelIdRevisionIdFromModelOptions.context';
import { type ReactElement, type ReactNode } from 'react';
import { FdmSDK } from '../data-providers/FdmSDK';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const classicModelOption = {
  modelId: 123,
  revisionId: 456
};
const dmModelOption = {
  revisionExternalId: 'default-revision-external-id1',
  revisionSpace: 'default-revision-space'
};

const dependencies = getMocksByDefaultDependencies(
  defaultModelIdRevisionIdFromModelOptionsDependencies
);

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <ModelIdRevisionIdFromModelOptionsContext.Provider value={dependencies}>
      {children}
    </ModelIdRevisionIdFromModelOptionsContext.Provider>
  </QueryClientProvider>
);

describe(useModelIdRevisionIdFromModelOptions.name, () => {
  beforeEach(() => {
    dependencies.useFdmSdk.mockReturnValue(new FdmSDK(sdkMock));
  });
  test('returns empty array if input is undefined', () => {
    const { result } = renderHook(() => useModelIdRevisionIdFromModelOptions(undefined), {
      wrapper
    });
    expect(result.current).toEqual([]);
  });

  test('returns modelId & revisionId for classic model option', async () => {
    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption]),
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current[0]).toBeDefined();
    });

    assert(result.current[0] !== undefined);

    expect(isClassicIdentifier(result.current[0])).toBe(true);
    expect(result.current[0]).toMatchObject(classicModelOption);
  });

  test('returns modelId & revisionId for dm model option', async () => {
    dependencies.getModelIdAndRevisionIdFromExternalId.mockReturnValue(
      Promise.resolve({
        modelId: 987,
        revisionId: 654
      })
    );
    const { result } = renderHook(() => useModelIdRevisionIdFromModelOptions([dmModelOption]), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current[0]).toBeDefined();
    });

    expect(isDM3DModelIdentifier(dmModelOption)).toBe(true);
    expect(result.current[0]).toMatchObject({
      modelId: 987,
      revisionId: 654
    });
  });

  test('returns correct modelId & revisionId for mixed classic and dm model options', async () => {
    dependencies.getModelIdAndRevisionIdFromExternalId.mockReturnValue(
      Promise.resolve({
        modelId: 987,
        revisionId: 654
      })
    );
    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.length).toBe(2);
    });

    expect(result.current.every(isClassicIdentifier)).toBe(true);
    expect(result.current[0]).toMatchObject(classicModelOption);

    expect(result.current[1]).toMatchObject({
      modelId: 987,
      revisionId: 654
    });
  });
});
