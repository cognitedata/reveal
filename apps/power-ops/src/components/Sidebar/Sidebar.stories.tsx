import { Meta, Story } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Sidebar } from 'components/Sidebar/Sidebar';
import { ComponentProps, useState } from 'react';

export default {
  component: Sidebar,
  title: 'Components/Sidebar',
  argTypes: {
    onNavigate: { action: 'navigate' },
    onSearch: { action: 'search' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof Sidebar>> = (args) => {
  const [open, setOpen] = useState(args.open ?? true);
  return (
    <Sidebar {...args} open={open} onOpenCloseClick={() => setOpen(!open)} />
  );
};

export const Default = Template.bind({});

Default.args = {
  plants: [
    {
      name: 'Øyberget',
      externalId: 'plant_ØYBE(2968)',
      url: '/portfolio/price_area_NO3/plant_ØYBE(2968)',
      current: false,
    },
    {
      name: 'Rauberget pumpestasjon',
      externalId: 'plant_RAUD(2978)',
      url: '/portfolio/price_area_NO3/plant_RAUD(2978)',
      current: false,
    },
    {
      name: 'Nedre Otta',
      externalId: 'plant_NOTT(251230)',
      url: '/portfolio/price_area_NO3/plant_NOTT(251230)',
      current: false,
    },
    {
      name: 'Skjåk',
      externalId: 'plant_SKJÅ(2986)',
      url: '/portfolio/price_area_NO3/plant_SKJÅ(2986)',
      current: false,
    },
    {
      name: 'Framruste',
      externalId: 'plant_FRAM(2965)',
      url: '/portfolio/price_area_NO3/plant_FRAM(2965)',
      current: false,
    },
  ],
  priceScenarios: {
    url: '/portfolio/price_area_NO3/price-scenarios',
    current: false,
  },
  total: {
    url: '/portfolio/price_area_NO3/total',
    current: false,
  },
};

export const Interactions = Template.bind({});
Interactions.args = { ...Default.args };
Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  // Show/Hide button tests
  const hideButton = canvas.getByLabelText('Show or hide sidebar');
  await userEvent.click(hideButton);
  expect(canvas.queryByText('Price area overview')).not.toBeInTheDocument();
  await userEvent.click(hideButton);
  expect(canvas.getByText('Price area overview')).toBeInTheDocument();

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
