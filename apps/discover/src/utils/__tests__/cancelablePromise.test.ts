import { convertToCancellablePromise } from 'utils/cancellablePromise';

describe('Cancellable Promise', () => {
  test('Should resolve response', async () => {
    const cancellablePromise = convertToCancellablePromise(
      Promise.resolve([0])
    );
    const response = await cancellablePromise.promise;
    expect(response).toEqual([0]);
  });

  test('Should reject on cancel', async () => {
    const cancellablePromise = convertToCancellablePromise(
      Promise.resolve([0])
    );
    cancellablePromise.cancel();
    await expect(cancellablePromise.promise).rejects.toMatchObject({
      message: 'Cancelled',
    });
  });

  test('Should reject on parent reject', async () => {
    const cancellablePromise = convertToCancellablePromise(
      Promise.reject(new Error('rejected'))
    );

    await expect(cancellablePromise.promise).rejects.toBeTruthy();
  });

  test('Should cancel on parent reject', async () => {
    const cancellablePromise = convertToCancellablePromise(
      Promise.reject(new Error('rejected'))
    );
    cancellablePromise.cancel();
    await expect(cancellablePromise.promise).rejects.toMatchObject({
      message: 'Cancelled',
    });
  });
});
