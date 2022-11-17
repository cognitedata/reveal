import { Meta, Story } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Sidebar } from 'components/Sidebar/Sidebar';
import { ComponentProps } from 'react';
import { mockDayAheadMarketSidebarPlants } from 'utils/test/mockPlants';

export default {
  component: Sidebar,
  title: 'Components/Sidebar',
  argTypes: {
    onNavigate: { action: 'navigate' },
    onSearch: { action: 'search' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof Sidebar>> = (args) => (
  <Sidebar {...args} />
);

export const Default = Template.bind({});

Default.args = {
  plants: mockDayAheadMarketSidebarPlants,
  priceScenarios: {
    url: '/portfolio/price_area_NO3/price-scenarios',
    current: false,
  },
  total: {
    url: '/portfolio/price_area_NO3/total',
    current: false,
  },
};

export const LongList = Template.bind({});

LongList.args = {
  ...Default.args,
  plants: Array(3)
    .fill('')
    .flatMap(() => mockDayAheadMarketSidebarPlants),
};

export const Interactions = Template.bind({});
Interactions.args = { ...Default.args };
Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  // Search Bar Tests
  const searchField = canvas.getByTestId('plant-search-input');
  await userEvent.type(searchField, 'nedre');

  expect(args.onSearch).toBeCalledWith('nedre');
  expect(canvas.getByText('Nedre Otta')).toBeInTheDocument();
  expect(canvas.getByText('Price area overview')).toBeInTheDocument();
  expect(canvas.getByText('Total')).toBeInTheDocument();
  expect(canvas.queryByText('Framruste')).not.toBeInTheDocument();

  await userEvent.clear(searchField);
  expect(canvas.getByText('Framruste')).toBeInTheDocument();
  expect(canvas.getByText('Nedre Otta')).toBeInTheDocument();
};
