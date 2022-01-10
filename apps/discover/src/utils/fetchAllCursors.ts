type CursorActionResult<T> = { items: T[]; nextCursor: string };
type ActionProps = Record<string, unknown>;
export type FetchOptions = { signal?: AbortSignal };
export const fetchAllCursors = async <T>({
  signal,
  action,
  actionProps,
}: {
  signal?: AbortSignal;
  actionProps: ActionProps;
  action: (props: ActionProps) => Promise<CursorActionResult<T>>;
}) => {
  let { items, nextCursor } = await action(actionProps);

  let shouldCancel = false;

  const markCancel = () => {
    shouldCancel = true;
  };

  signal?.addEventListener('abort', markCancel);

  while (nextCursor) {
    // eslint-disable-next-line no-await-in-loop
    const response = await action({
      ...actionProps,
      cursor: nextCursor,
    });
    nextCursor = response.nextCursor;
    items = [...items, ...response.items];

    if (shouldCancel) {
      nextCursor = '';
      shouldCancel = false;
      signal?.removeEventListener('abort', markCancel);
    }
  }

  return items;
};
