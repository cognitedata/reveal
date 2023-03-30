export const getAverageTickTextWidth = (xticks: HTMLCollectionOf<Element>) => {
  const totalWidth = Array.from(xticks).reduce((total, xtick) => {
    return total + xtick.getBoundingClientRect().width;
  }, 0);

  return Math.round(totalWidth / xticks.length);
};
