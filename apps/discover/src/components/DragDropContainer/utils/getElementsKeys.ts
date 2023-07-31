export const getElementsKeys = (elements: JSX.Element[]) => {
  return elements.map(({ key }) => String(key).slice(2));
};
