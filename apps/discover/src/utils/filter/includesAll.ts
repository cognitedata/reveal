export const includesAll = (string: string, targets: string[]) => {
  return targets.every((target) => string.includes(target));
};
