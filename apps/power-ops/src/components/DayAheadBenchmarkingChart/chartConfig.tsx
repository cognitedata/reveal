import CSS from 'csstype';

import {
  CardSection,
  CardText,
  CardTitle,
  ColorIndicator,
  FlexRow,
  FlexColumn,
  DashedIndicator,
} from '../CommonChart/elements';

export const layout: Partial<Plotly.Layout> = {
  paper_bgcolor: '#fafafa',
  plot_bgcolor: 'transparent',
  autosize: true,
  margin: {
    t: 16,
    b: 0,
    r: 0,
    l: 48,
  },
  showlegend: true,
  legend: {
    orientation: 'h',
    x: 0.5,
    xanchor: 'center',
  },
  font: {
    family: 'Inter',
    size: 12,
  },
  xaxis: {
    type: 'date',
    color: 'rgba(0, 0, 0, 0.45)',
    title: {
      standoff: 8,
      text: 'Date',
      font: {
        size: 10,
      },
    },
    tickformat: '%d.%m',
    showline: true,
    position: 0,
    linecolor: '#E8E8E8',
    spikemode: 'across',
    spikesnap: 'hovered data',
    spikethickness: 1,
    spikedash: 'solid',
    spikecolor: '#8C8C8C',
    fixedrange: true,
  },
  yaxis: {
    color: 'rgba(0, 0, 0, 0.45)',
    position: 100,
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
  height: '100%',
  overflow: 'hidden',
};

export const Card = ({
  title,
  value,
  solidLineColor,
  dashedLineColor,
}: {
  title: string;
  value?: string;
  solidLineColor?: string;
  dashedLineColor?: string;
}) => {
  return (
    <CardSection>
      <FlexRow>
        {solidLineColor && <ColorIndicator color={solidLineColor} />}
        {dashedLineColor && <DashedIndicator color={dashedLineColor} />}
        <FlexColumn>
          <CardTitle>{title}</CardTitle>
          {value && <CardText>{value}</CardText>}
        </FlexColumn>
      </FlexRow>
    </CardSection>
  );
};
