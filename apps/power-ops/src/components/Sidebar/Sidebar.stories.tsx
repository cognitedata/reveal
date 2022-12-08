import { Meta, Story } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Sidebar } from 'components/Sidebar/Sidebar';
import { ComponentProps } from 'react';
import { mockDayAheadMarketSidebarPlants } from 'utils/test/mockPlants';
import { reactRouterDecorator } from 'utils/test/storyDecorators';
import { SECTIONS } from 'types';

export default {
  component: Sidebar,
  title: 'Components/Sidebar',
  argTypes: {
    onNavigate: { action: 'navigate' },
    onSearch: { action: 'search' },
  },
  decorators: [reactRouterDecorator()],
} as Meta;

const Template: Story<ComponentProps<typeof Sidebar>> = (args) => (
  <Sidebar {...args} />
);

export const Default = Template.bind({});

Default.args = {
  plants: mockDayAheadMarketSidebarPlants,
  priceScenarios: {
    url: `/portfolio/price_area_NO3/${SECTIONS.PRICE_SCENARIOS}`,
    current: false,
  },
  methodPerformance: {
    url: `/portfolio/price_area_NO3/${SECTIONS.BENCHMARKING}`,
    current: false,
  },
  total: {
    url: `/portfolio/price_area_NO3/${SECTIONS.TOTAL}`,
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
Interactions.play = ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  // Search Bar Tests
  const searchField = canvas.getByTestId('plant-search-input');
  userEvent.type(searchField, 'nedre');

  expect(args.onSearch).toBeCalledWith('nedre');
  expect(canvas.getByText('Nedre Otta')).toBeInTheDocument();
  expect(canvas.getByText('Price area overview')).toBeInTheDocument();
  expect(canvas.getByText('Total')).toBeInTheDocument();
  expect(canvas.queryByText('Framruste')).not.toBeInTheDocument();

  userEvent.clear(searchField);
  expect(canvas.getByText('Framruste')).toBeInTheDocument();
  expect(canvas.getByText('Nedre Otta')).toBeInTheDocument();
};
