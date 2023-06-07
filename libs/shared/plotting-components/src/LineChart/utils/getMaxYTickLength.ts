import last from 'lodash/last';

export const getMaxYTickLength = (graph: HTMLElement | null) => {
  const yticks = graph?.getElementsByClassName('ytick');
  const yTickWithMaxWidth = last(yticks);

  return yTickWithMaxWidth?.getBoundingClientRect().width || 0;
};
