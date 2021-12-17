type CursorActionResult<T> = { items: T[]; nextCursor: string };
type ActionProps = Record<string, unknown>;
export const fetchAllCursors = async <T>({
  action,
  actionProps,
}: {
  actionProps: ActionProps;
  action: (props: ActionProps) => Promise<CursorActionResult<T>>;
}) => {
  let { items, nextCursor } = await action(actionProps);

  while (nextCursor) {
    // eslint-disable-next-line no-await-in-loop
    const response = await action({
      ...actionProps,
      cursor: nextCursor,
    });
    nextCursor = response.nextCursor;
    items = [...items, ...response.items];
  }

  return items;
};
