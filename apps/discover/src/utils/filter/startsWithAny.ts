export const startsWithAny = (string: string, targets: string[]) => {
  return targets.some((target) => string.startsWith(target));
};
