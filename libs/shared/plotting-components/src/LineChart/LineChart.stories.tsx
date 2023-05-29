import { useEffect, useMemo, useState } from 'react';

import { ComponentStory } from '@storybook/react';
import html2canvas from 'html2canvas';
import get from 'lodash/get';

import { Button, Select } from '@cognite/cogs.js';

import { data as mockData } from './__mocks/data';
import { LineChart } from './LineChart';
import { LineChartProps } from './types';

export default {
  title: 'Shared/PlottingComponents/LineChart',
  component: LineChart,
};

const data = mockData.reduce(
  (result, [dataX, dataY]) => {
    return {
      x: [...result.x, dataX],
      y: [...result.y, dataY],
    } as any;
  },
  {
    x: [] as number[],
    y: [] as number[],
  }
);

const props: LineChartProps = {
  data: {
    ...data,
    customData: {
      timezone: '02:00 GMT(+02:00)',
    },
  },
  xAxis: { name: 'Date' },
  yAxis: { name: 'Value' },
  title: 'Main title',
  subtitle: 'Subtitle or description',
  config: {
    scrollZoom: 'x',
    selectionZoom: [
      { trigger: 'default', direction: 'x+y' },
      { trigger: 'Shift', direction: 'x' },
    ],
    buttonZoom: 'x',
  },
  renderFilters: () => [<Select options={[]} width={200} theme="filled" />],
  renderActions: () => [
    <Button role="link" size="small" type="ghost-accent" icon="LineChart">
      Open in Charts
    </Button>,
  ],
  formatHoverLineInfo: ({ x, customData }) =>
    `${String(x)}, ${get(customData, 'timezone')}`,
};

export const Basic: ComponentStory<typeof LineChart> = (args) => {
  return <LineChart {...args} />;
};
Basic.args = props;

const ChartWithWrapper: React.FC<
  LineChartProps & { wrapperStyle: React.CSSProperties }
> = ({ wrapperStyle, ...lineChartProps }) => {
  return (
    <div style={wrapperStyle}>
      <LineChart {...lineChartProps} />
    </div>
  );
};
export const WithWrapper: ComponentStory<typeof ChartWithWrapper> = (args) => {
  return <ChartWithWrapper {...args} />;
};

WithWrapper.args = {
  ...props,
  wrapperStyle: {
    height: 300,
    transform: 'scale(0.75)',
  },
};

const Chart2Canvas: React.FC<
  LineChartProps & { wrapperStyle: React.CSSProperties }
> = ({ wrapperStyle, ...lineChartProps }) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (ref !== null) {
      setInterval(async () => {
        setCanvas(await html2canvas(ref, { logging: true }));
      }, 2500);
    }
  }, [ref]);

  const dataUrl = useMemo(() => {
    if (canvas === null) {
      return undefined;
    }
    return canvas.toDataURL();
  }, [canvas]);

  return (
    <div>
      <h1>DOM-node</h1>
      <div ref={setRef} style={wrapperStyle}>
        <LineChart {...lineChartProps} />
      </div>
      <h1>Screenshot</h1>
      <div>
        {dataUrl !== undefined && (
          <img src={dataUrl} height={wrapperStyle.height} />
        )}
      </div>
    </div>
  );
};

export const Chart2CanvasStory: ComponentStory<typeof Chart2Canvas> = (
  args
) => {
  return <Chart2Canvas {...args} />;
};

Chart2CanvasStory.args = {
  ...props,
  wrapperStyle: {
    height: 300,
    transform: 'scale(0.75)',
  },
};
