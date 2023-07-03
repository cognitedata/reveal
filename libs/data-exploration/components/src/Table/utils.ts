export const getHighlightQuery = (enabled?: boolean, query?: string) => {
  return enabled ? query : undefined;
};
