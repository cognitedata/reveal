/*!
 * Copyright 2025 Cognite AS
 */
import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../utilities/TranslateInput';
import { FitViewCommand } from './FitViewCommand';
import { fitCameraToBoundingBoxMock } from '#test-utils/fixtures/viewer';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';

describe(FitViewCommand.name, () => {
  let command: FitViewCommand;
  const renderTarget = createFullRenderTargetMock();

  beforeEach(() => {
    command = new FitViewCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(command.icon).toBe('ExpandAlternative');
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
  });

  test('Should fit camera to bounding box', () => {
    fitCameraToBoundingBoxMock.mockClear();
    expect(command.invoke()).toBe(true);
    expect(fitCameraToBoundingBoxMock).toHaveBeenCalledOnce();
  });
});
