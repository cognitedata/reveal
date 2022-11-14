export const orderElementsByKey = (
  elements: JSX.Element[],
  elementsOrder: string[]
) => {
  /**
   * In the DOM, the `key` prop of elements are prefixed with `.$`.
   *
   * @example
   * If we pass `key="example-key"`,
   * we can see in the DOM element that `key=".$example-key"`.
   *
   * Here, we add that prefix to deal with the DOM element keys.
   */
  const elementsOrderWithPrefix = elementsOrder.map(key => `.$${key}`);

  return elements.sort(
    (element1, element2) =>
      elementsOrderWithPrefix.indexOf(String(element1.key)) -
      elementsOrderWithPrefix.indexOf(String(element2.key))
  );
};
