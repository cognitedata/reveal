import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { typeFilterOptionsMock } from 'components/BenchmarkingFilters/BenchmarkingFilters.mock';

import { BenchmarkingTypeSelect as BenchmarkingTypeFilter } from './BenchmarkingTypeFilter';

export default {
  component: BenchmarkingTypeFilter,
  title: 'Components/BenchMarking Day Ahead/Benchmarking Type',
  argTypes: {
    onChange: { action: 'Value Changed' },
    value: { control: 'text' },
  },
  args: {
    filterOptions: typeFilterOptionsMock,
    value: 'price_independent_NO1',
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/QlY4FXT7nVnGqwRBOr0yPl/PowerOps-%7C-Working-Environment?node-id=1354%3A154201&t=sdKTfwUYnv6Jve7g-1',
    },
  },
} as Meta;

const Template: Story<ComponentProps<typeof BenchmarkingTypeFilter>> = (
  args
) => <BenchmarkingTypeFilter {...args} />;

export const Closed = Template.bind({});

export const Opened = Template.bind({});

Opened.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const select = canvas.getByLabelText('Type');
  userEvent.click(select);
  const subMenu = await canvas.findByText('Difference');
  userEvent.hover(subMenu);
};

export const Interactions = Template.bind({});

Interactions.play = async ({ canvasElement, args, ...rest }) => {
  const canvas = within(canvasElement);
  Opened.play!({ canvasElement, args, ...rest });

  // Test if submenu opens
  const priceIndependent = await canvas.findByText('Price independent NO1');
  expect(priceIndependent).toBeInTheDocument();

  // Test if user can select option from submenu
  userEvent.click(priceIndependent, undefined, {
    skipPointerEventsCheck: true,
  });
  expect(args.onChange).toBeCalledWith('price_independent_NO1');
};
