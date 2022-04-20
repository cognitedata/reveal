export const layout: Partial<Plotly.Layout> = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  autosize: true,
  margin: {
    t: 30,
    b: 60,
    l: 60,
    r: 30,
    pad: 12,
  },
  showlegend: false,
  font: {
    family: 'Inter',
    size: 12,
  },
  xaxis: {
    autorange: true,
    color: 'rgba(0, 0, 0, 0.45)',
    gridcolor: '#E8E8E8',
    title: {
      text: 'Hour',
      font: {
        size: 10,
      },
    },
    fixedrange: true,
    showline: true,
    position: 0,
    linecolor: '#E8E8E8',
    spikemode: 'across',
    spikesnap: 'hovered data',
    spikethickness: 1,
    spikedash: 'solid',
    spikecolor: '#8C8C8C',
  },
  yaxis: {
    autorange: true,
    color: 'rgba(0, 0, 0, 0.45)',
    gridcolor: '#E8E8E8',
    title: {
      text: 'Price (NOK)',
      font: {
        size: 10,
      },
    },
    fixedrange: true,
    spikemode: 'across',
    spikesnap: 'hovered data',
    spikethickness: 1,
    spikedash: 'solid',
    spikecolor: '#8C8C8C',
  },
  hovermode: 'closest',
  hoverlabel: {
    bgcolor: '#ffffff',
  },
};

export const chartStyles = {
  display: 'flex',
  width: '100%',
  height: '368px',
};
