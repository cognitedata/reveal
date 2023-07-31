export const orderElementsByKey = (
  elements: JSX.Element[],
  elementsOrder: string[]
) => {
  const elementsOrderWithPrefix = elementsOrder.map((key) => `.$${key}`);

  return elements.sort(
    (element1, element2) =>
      elementsOrderWithPrefix.indexOf(String(element1.key)) -
      elementsOrderWithPrefix.indexOf(String(element2.key))
  );
};
