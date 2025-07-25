import {
  type PointerEventDelegate,
  type Cognite3DViewer,
  type DataSourceType
} from '@cognite/reveal';
import { act } from '@testing-library/react';
import { assert, vi } from 'vitest';

function isPointerEventDelegate(fn: unknown): fn is PointerEventDelegate {
  return typeof fn === 'function' && fn.length === 1;
}

// Get click callback
export function getClickCallback(viewer: Cognite3DViewer<DataSourceType>): PointerEventDelegate {
  const onClickCallback = vi
    .mocked(viewer.on)
    .mock.calls.find(([eventName]) => (eventName as string) === 'click')?.[1];
  assert(isPointerEventDelegate(onClickCallback));
  return onClickCallback;
}

// Simulate a click
export async function simulateClick(
  callback: PointerEventDelegate,
  button: number,
  offsetX = 100,
  offsetY = 200
): Promise<void> {
  await act(async () => {
    callback({ button, offsetX, offsetY });
  });
}
