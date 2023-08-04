import queryString from 'query-string';

// @cognite/cdf-utilities utils
// please remove all the things below and adopt this package
// you also need to remove Breadcrumbs related components from this project and use those from cdf-utilities package

export const getQueryParameter = (parameterKey: string) => {
  const parameters = queryString.parse(window.location.search) ?? {};
  return parameters[parameterKey] ?? '';
};
