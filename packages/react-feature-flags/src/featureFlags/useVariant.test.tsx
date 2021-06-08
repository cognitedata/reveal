import React from 'react';

import { renderHook } from '@testing-library/react-hooks';
import { IVariant, UnleashClient } from 'unleash-proxy-client';
import { sandbox } from '@cognite/testing';
import { FlagContext } from './FlagContext';
import { useVariant } from './useVariant';

describe('useVariant', () => {
  const client = new UnleashClient({
    appName: 'test',
    clientKey: 'any',
    url: 'https://localhost',
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FlagContext.Provider value={{ client }}>{children}</FlagContext.Provider>
  );

  it('Should return an empty string when no client is found', () => {
    const { result } = renderHook(() => useVariant('test-flag'), {
      wrapper,
    });
    expect(result.current).toBe('');
  });

  it('Should return an empty string when no variant is found', () => {
    sandbox.stub(client, 'getVariant').returns({} as unknown as IVariant);
    const { result } = renderHook(() => useVariant('test-flag'), {
      wrapper,
    });
    expect(result.current).toBe('');
  });

  it('Should return the variant value', () => {
    sandbox.stub(client, 'getVariant').returns({
      payload: { value: 'variant-value' },
    } as unknown as IVariant);
    const { result } = renderHook(() => useVariant('test-flag'), {
      wrapper,
    });
    expect(result.current).toBe('variant-value');
  });
});
