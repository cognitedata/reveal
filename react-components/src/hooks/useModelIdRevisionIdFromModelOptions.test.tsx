import { describe, expect, test, assert, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { useModelIdRevisionIdFromModelOptions } from './useModelIdRevisionIdFromModelOptions';
import {
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';
import { wrapper } from '#test-components/fixtures/wrapper';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';

vi.mock(import('./network/getModelIdAndRevisionIdFromExternalId'));

const classicModelOption = {
  modelId: 123,
  revisionId: 456
};
const dmModelOption = {
  revisionExternalId: 'default-revision-external-id1',
  revisionSpace: 'default-revision-space'
};

describe(useModelIdRevisionIdFromModelOptions.name, () => {
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
    vi.mocked(getModelIdAndRevisionIdFromExternalId).mockResolvedValue({
      modelId: 987,
      revisionId: 654
    });
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
});
