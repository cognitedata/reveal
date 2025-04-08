import { waitFor } from '@testing-library/react';
import { expect } from 'vitest';

const AWAIT_TIME_SLOT_MS = 50;

/**
 * This function waits for the `check` callback to succeed repeatedly within a small period of time.
 * If the callback does not succeed within the allocated time, this function succeeds
 * If the callback succeeds within the allocated time, this function throws
 *
 * There is a margin of error here, since we cannot know for sure whether
 * the callback would succeed after the allocated time
 */
export async function expectAwaitToFail<T>(check: () => Promise<T>): Promise<void> {
  await expect(waitFor(check, { timeout: AWAIT_TIME_SLOT_MS })).rejects.toThrow();
}
