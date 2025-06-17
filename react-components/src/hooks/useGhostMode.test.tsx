import { renderHook } from '@testing-library/react';
import { act, type PropsWithChildren, type ReactElement } from 'react';
import { beforeEach, describe, expect, test } from 'vitest';

import { useGhostMode } from './useGhostMode';
import { type RevealRenderTarget } from '../architecture';
import { ViewerContextProvider } from '../components/RevealCanvas/ViewerContext';
import { createFullRenderTargetMock } from '../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { SetGhostModeCommand } from '../architecture/base/concreteCommands/cad/SetGhostModeCommand';
import { getDefaultCommand } from '../components/Architecture/utilities';

describe(useGhostMode.name, () => {
  let renderTarget: RevealRenderTarget;
  let command: SetGhostModeCommand;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    // This add the SetGhostModeCommand to the list of available commends
    command = getDefaultCommand(new SetGhostModeCommand(), renderTarget);
  });

  test('should not have ghostMode', () => {
    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider value={renderTarget}>{children}</ViewerContextProvider>
    );
    command.setChecked(false);
    const { result } = renderHook(() => useGhostMode(), {
      wrapper
    });
    expect(result.current).toBe(false);
  });

  test('should change ghostMode', () => {
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
