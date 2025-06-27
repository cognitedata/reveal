import { renderHook } from '@testing-library/react';
import { act, type PropsWithChildren, type ReactElement } from 'react';
import { describe, expect, test } from 'vitest';
import { useGhostMode } from './useGhostMode';
import { ViewerContextProvider } from '../components/RevealCanvas/ViewerContext';
import { createFullRenderTargetMock } from '../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { SetGhostModeCommand } from '../architecture/base/concreteCommands/cad/SetGhostModeCommand';
import { getDefaultCommand } from '../components/Architecture/utilities';

describe(useGhostMode.name, () => {
  test('should not have ghostMode', () => {
    const renderTarget = createFullRenderTargetMock();
    const command = getDefaultCommand(new SetGhostModeCommand(), renderTarget);

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider value={renderTarget}>{children}</ViewerContextProvider>
    );
    command.setChecked(false);
    const { result } = renderHook(() => useGhostMode(), {
      wrapper
    });
    expect(result.current).toBe(false);
  });

  test('should not have ghostMode when the command is not added to the RenderTarget ', () => {
    const renderTarget = createFullRenderTargetMock();
    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider value={renderTarget}>{children}</ViewerContextProvider>
    );
    const { result } = renderHook(() => useGhostMode(), {
      wrapper
    });
    expect(result.current).toBe(false);
  });

  test('should change ghostMode', () => {
    const renderTarget = createFullRenderTargetMock();
    const command = getDefaultCommand(new SetGhostModeCommand(), renderTarget);
    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider value={renderTarget}>{children}</ViewerContextProvider>
    );
    const { result } = renderHook(() => useGhostMode(), {
      wrapper
    });

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
