const scoreFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export const scoreFormat = (n: number) => scoreFormatter.format(n);
