export const readCssVariablePixelNumber = (property: string): number => {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue(property), 10);
};

export const setCssVariable = (property: string, value: string) => {
  document.documentElement.style.setProperty(property, value);
};