export const formatFacetValueFromTemplate = (
  prefix: string,
  value: string,
  hidePrefix?: boolean
) => (hidePrefix ? value : `${prefix}: ${value}`);
