export const serializeParams = (params: Record<string, string>) => {
  return Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
};
