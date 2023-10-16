import { PlatypusError, Result } from '@fusion/data-modeling';

import { Notification } from '../components/Notification/Notification';

export async function apiResultFuncWrapper<T>(
  callableFn: () => Promise<Result<T>>
) {
  const result = await callableFn();
  if (!result.isSuccess) {
    Notification({ type: 'error', message: result.error.message });
    throw result.error;
  }
  return result.getValue();
}

export async function apiCommandFuncWrapper<T>(callableFn: () => Promise<T>) {
  let result;
  try {
    result = await callableFn();
  } catch (error) {
    if ((error as PlatypusError).message) {
      Notification({
        type: 'error',
        message: (error as PlatypusError).message,
      });
    }
    throw error;
  }

  return result;
}
