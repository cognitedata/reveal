import { renderHook } from '@testing-library/react';
import { act, type PropsWithChildren, type ReactElement } from 'react';
import { describe, expect, test } from 'vitest';
import { useGhostMode } from './useGhostMode';
import { ViewerContextProvider } from '../components/RevealCanvas/ViewerContext';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { SetGhostModeCommand } from '../architecture/base/concreteCommands/cad/SetGhostModeCommand';
import { getDefaultCommand } from '../components/Architecture/utilities';
import { ComponentFactoryContextProvider } from '../components/RevealCanvas/ComponentFactoryContext';

describe(useGhostMode.name, () => {
  test('should not have ghostMode', () => {
    const renderTarget = createFullRenderTargetMock();
    const command = getDefaultCommand(new SetGhostModeCommand(), renderTarget);
    command.setChecked(false);

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ComponentFactoryContextProvider>
        <ViewerContextProvider value={renderTarget}>{children}</ViewerContextProvider>
      </ComponentFactoryContextProvider>
    );
    const { result } = renderHook(() => useGhostMode(), { wrapper });

    expect(result.current).toBe(false);
  });

  test('should not have ghostMode when the command is not added to the RenderTarget ', () => {
    const renderTarget = createFullRenderTargetMock();
    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ComponentFactoryContextProvider>
        <ViewerContextProvider value={renderTarget}>{children}</ViewerContextProvider>
      </ComponentFactoryContextProvider>
    );
    const { result } = renderHook(() => useGhostMode(), { wrapper });
    expect(result.current).toBe(false);
  });

  test('should change ghostMode', () => {
    const renderTarget = createFullRenderTargetMock();
    const command = getDefaultCommand(new SetGhostModeCommand(), renderTarget);
    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ComponentFactoryContextProvider>
        <ViewerContextProvider value={renderTarget}>{children}</ViewerContextProvider>
      </ComponentFactoryContextProvider>
    );
    const { result } = renderHook(() => useGhostMode(), { wrapper });

    act(() => {
      command.setChecked(true);
      command.update();
    });
    expect(result.current).toBe(true);

    act(() => {
      command.setChecked(false);
      command.update();
    });
    expect(result.current).toBe(false);
  });
});
