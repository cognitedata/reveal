import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { UnleashClient } from 'unleash-proxy-client';
import { sandbox } from '@cognite/testing';

import { FlagProvider, useFlag } from '.';
import { FlagContext } from './FlagContext';

describe('FeatureToggle', () => {
  const client = new UnleashClient({
    appName: 'test',
    clientKey: 'any',
    url: 'https://localhost',
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <FlagContext.Provider value={{ client }}>{children}</FlagContext.Provider>
  );

  it('Should default to the defaulted value (false)', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sandbox.stub(client, 'isEnabled').returns(undefined);
    const { result } = renderHook(() => useFlag('test-flag'), {
      wrapper,
    });
    expect(result.current.isEnabled).toBe(false);
  });

  it('Should default to the defaulted value (true)', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sandbox.stub(client, 'isEnabled').returns(undefined);
    const { result } = renderHook(
      () => useFlag('test-flag', { fallback: true }),
      {
        wrapper,
      }
    );
    expect(result.current.isEnabled).toBe(true);
  });

  it('Should the default value will super fast change to false', () => {
    sandbox.stub(client, 'isEnabled').returns(false);
    const { result } = renderHook(
      () => useFlag('test-flag', { fallback: true }),
      {
        wrapper,
      }
    );
    expect(result.current.isEnabled).toBe(false);
  });

  it('Should return undefined for isClientReady boolean at first render without FlagProvider', () => {
    const { result } = renderHook(() => useFlag('test-flag'), {
      wrapper,
    });
    expect(result.current.isClientReady).toBe(undefined);
  });

  it('Should return false for isClientReady boolean at first render with FlagProvider', () => {
    const wrapperWithFlagProvider = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <FlagProvider appName="not used" apiToken="not used">
        {children}
      </FlagProvider>
    );
    const { result } = renderHook(() => useFlag('test-flag'), {
      wrapper: wrapperWithFlagProvider,
    });
    expect(result.current.isClientReady).toBe(false);
  });
});
