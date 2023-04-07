export const isElementHorizontallyInViewport = (element: Element) => {
  const bounding = element?.getBoundingClientRect();

  return (
    bounding &&
    bounding.top >= 0 &&
    bounding.left >= 0 &&
    bounding.bottom <=
      (window.innerHeight || document.documentElement.clientHeight)
  );
};
