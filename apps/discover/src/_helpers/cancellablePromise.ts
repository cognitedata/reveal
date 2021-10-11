export interface CancellablePromise {
  promise: Promise<any>;
  cancel: () => void;
}

export const convertToCancellablePromise = (
  promise: Promise<any>
): CancellablePromise => {
  let hasCanceled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (val) => (hasCanceled ? reject(new Error('cancelled')) : resolve(val)),
      (error) => (hasCanceled ? reject(new Error('cancelled')) : reject(error))
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    },
  };
};
