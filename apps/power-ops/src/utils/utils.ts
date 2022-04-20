export const CHART_COLORS: string[] = [
  '#008b8b',
  '#ffa500',
  '#00bf00',
  '#797979',
  '#006400',
  '#bdb76b',
  '#8b008b',
  '#556b2f',
  '#ff8c00',
  '#9932cc',
  '#8b0000',
  '#ef967a',
  '#9400d3',
  '#ff00ff',
  '#fbaf00',
  '#008000',
  '#4b0082',
  '#00c090',
  '#ff00ff',
  '#800000',
  '#000080',
  '#808000',
  '#800080',
  '#ff0000',
  '#ffab00',
  '#0000ff',
  '#a52a2a',
  '#00008b',
];

export const pickChartColor = (index: number) => {
  return CHART_COLORS[index % CHART_COLORS.length];
};
