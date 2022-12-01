export const includesAny = (string: string, targets: string[]) => {
  return targets.some((target) => string.includes(target));
};
