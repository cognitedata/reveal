export const orderElementsByKey = (
  elements: JSX.Element[],
  elementsOrder: string[]
) => {
  /**
   * In the DOM, the `key` prop of elements are prefixed with `.$`.
   * And the ':' character is translated into '=2' for some reason.
   *
   * @example
   * If we pass `key="example-key"`,
   * we can see in the DOM element that `key=".$example-key"`.
   * Here, we add that prefix to deal with the DOM element keys.
   *
   * If the key looks like `key="example:something"`, in the DOM it will be `key="example=2something"`
   * that's why we have the .replace() call
   */
  const elementsOrderWithPrefix = elementsOrder.map(key => `.$${key}`);

  return elements.sort((element1, element2) => {
    return (
      elementsOrderWithPrefix.indexOf(String(element1.key).replace('=2', ':')) -
      elementsOrderWithPrefix.indexOf(String(element2.key).replace('=2', ':'))
    );
  });
};
