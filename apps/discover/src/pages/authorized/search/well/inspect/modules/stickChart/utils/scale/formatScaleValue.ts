export const formatScaleValue = (value: number) => {
  const THOUSAND = 1000;

  const isThousands = value >= THOUSAND;

  // if value is >999 display suffix with 'k'.
  if (isThousands) {
    return `${value / THOUSAND}k`;
  }

  // if value below <1000, just display the original value.
  return value;
};
