import CSS from 'csstype';

import {
  ColorIndicator,
  CardTitle,
  FlexRow,
  CardSection,
  CardText,
} from './elements';

export const layout: Partial<Plotly.Layout> = {
  paper_bgcolor: '#fafafa',
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
      text: 'Time',
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
    spikemode: 'across',
    spikesnap: 'hovered data',
    spikethickness: 1,
    spikedash: 'solid',
    spikecolor: '#8C8C8C',
  },
  hovermode: 'closest',
  dragmode: 'pan',
};

export const chartStyles: CSS.Properties = {
  width: '100%',
  height: '368px',
  overflow: 'hidden',
};

export const Card = ({
  title,
  value,
  color,
}: {
  title: string;
  value?: string;
  color?: string;
}) => {
  return (
    <CardSection>
      <FlexRow>
        {color && <ColorIndicator color={color} />}
        <CardTitle>{title}</CardTitle>
      </FlexRow>
      {value && <CardText>{value}</CardText>}
    </CardSection>
  );
};
