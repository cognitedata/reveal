import get from 'lodash/get';

type CursorActionResult<T> = { items: T[]; nextCursor: string };
type ActionProps = Record<string, unknown>;
export type FetchOptions = { signal?: AbortSignal };

/**
 * firstActionProps - useful when passing 'count' aggregate into only the first request (eg: we don't need it when we search the cursors)
 */
export const fetchAllCursors = async <T>({
  action,
  actionProps,
  firstActionProps,
  signal,
}: {
  action: (props: ActionProps) => Promise<CursorActionResult<T>>;
  actionProps: ActionProps;
  firstActionProps?: ActionProps;
  signal?: AbortSignal;
}) => {
  let { items, nextCursor } = await action({
    ...actionProps,
    ...firstActionProps,
  });

  let shouldCancel = false;

  const markCancel = () => {
    shouldCancel = true;
  };

  signal?.addEventListener('abort', markCancel);

  while (nextCursor) {
    // this eslint rule is made because generally we should do things in parrallel
    // but this is a good exception case
    // as these are sequential cursors, so they are ok to block
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

/**
 * This is useful when the response has ONLY ONE ITEM. (Which is different from `{ items: T[], nextCursor?: string }`)
 * Here, `nextCursor` is to fetch data for some attribute of the item.
 * That attribute key should be passed as the `concatAccessor` to join the upcoming cursors data.
 *
 * Example usage: Wells SDK V3 -> measurements.listData
 */
export const fetchAllCursorsItem = async <T extends Record<string, any>>({
  signal,
  action,
  actionProps,
  concatAccessor,
}: {
  signal?: AbortSignal;
  actionProps: ActionProps;
  action: (props: ActionProps) => Promise<T>;
  concatAccessor: keyof T;
}) => {
  let { nextCursor, ...item } = await action(actionProps);

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
    item = {
      ...item,
      [concatAccessor]: [
        ...get(item, concatAccessor, []),
        ...get(item, concatAccessor, []),
      ],
    };

    if (shouldCancel) {
      nextCursor = '';
      shouldCancel = false;
      signal?.removeEventListener('abort', markCancel);
    }
  }

  return item as T;
};
