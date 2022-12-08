import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';

import { DayAheadBenchmarkingTooltipContent } from './DayAheadBenchmarkingTooltipContent';

export default {
  component: DayAheadBenchmarkingTooltipContent,
  title: 'Components/BenchMarking Day Ahead/Tooltip',
  args: {
    tooltipData: {
      name: 'Test',
      latestRunDate: '2022-11-22',
      latestRunValue: '00.00',
      firstRunDate: '2022-11-01',
      firstRunValue: '00.00',
      color: 'red',
    },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/QlY4FXT7nVnGqwRBOr0yPl/PowerOps-%7C-Working-Environment?node-id=1354%3A154699&t=sdKTfwUYnv6Jve7g-1',
    },
  },
} as Meta;

const Template: Story<
  ComponentProps<typeof DayAheadBenchmarkingTooltipContent>
> = (args) => <DayAheadBenchmarkingTooltipContent {...args} />;

export const Default = Template.bind({});
