export const getReorderedElements = <T>(
  orderedElements: React.FunctionComponentElement<T>[],
  startIndex: number,
  endIndex: number
) => {
  const reorderedElements = Array.from(orderedElements);
  const [removed] = reorderedElements.splice(startIndex, 1);
  reorderedElements.splice(endIndex, 0, removed);
  return reorderedElements;
};
