import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';

import { CommonChartTooltip } from './CommonChartTooltip';

export default {
  component: CommonChartTooltip,
  title: 'Components/Common Chart Tooltip',
  args: {
    content: (
      <div
        style={{
          boxSizing: 'border-box',
          border: 'solid black 1px',
          padding: '10px',
          width: '100px',
          textAlign: 'center',
        }}
      >
        Hello world!
      </div>
    ),
    offset: { top: 0, left: 120 },
    visible: true,
  },
} as Meta;

const Template: Story<ComponentProps<typeof CommonChartTooltip>> = (args) => (
  <>
    <CommonChartTooltip {...args} />
    <div style={{ position: 'absolute', top: 0, left: '119px' }}>·</div>
  </>
);

export const Default = Template.bind({});

export const AlignedLeftFromPoint = Template.bind({});

AlignedLeftFromPoint.args = {
  alignClass: 'left-from-point',
};
