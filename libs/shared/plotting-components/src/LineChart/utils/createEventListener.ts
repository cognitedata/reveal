export const createEventListener = (
  element: Document | Element | null | undefined,
  type: string,
  listener: (event: Event) => void
) => {
  if (!element) {
    return;
  }
  element.addEventListener(type, listener);
  return () => element.removeEventListener(type, listener);
};
