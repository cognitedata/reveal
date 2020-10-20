export const isProduction = () =>
  window?.location?.hostname === 'fusion.cognite.com';
export const isStaging = () =>
  window?.location?.hostname === 'staging.fusion.cognite.com';
