export const endsWithAny = (string: string, targets: string[]) => {
  return targets.some((target) => string.endsWith(target));
};
