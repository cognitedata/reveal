export const addPlusSignToCount = (
  count: number | string,
  hasMoreCount?: boolean
) => {
  return hasMoreCount ? `${count}+` : `${count}`;
};
