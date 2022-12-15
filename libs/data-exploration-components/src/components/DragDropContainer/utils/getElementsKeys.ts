/**
 * In the DOM, the `key` prop of elements are prefixed with `.$`.
 *
 * @example
 * If we pass `key="example-key"`,
 * we can see in the DOM element that `key=".$example-key"`.
 *
 * Here, we remove that prefix and return the original keys.
 */
export const getElementsKeys = (elements: JSX.Element[]) => {
  return elements.map(({ key }) => String(key).slice(2));
};
