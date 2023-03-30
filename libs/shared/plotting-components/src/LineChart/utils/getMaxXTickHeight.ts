import max from 'lodash/max';

export const getMaxXTickHeight = (graph: HTMLElement | null) => {
  const xticks = graph?.getElementsByClassName('xtick') || [];
  const xticksHeights = Array.from(xticks).map(
    (xtick) => xtick.getBoundingClientRect().height
  );

  return max(xticksHeights) || 0;
};
