import { Meta, Story } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { CommonSidebar } from 'components/CommonSidebar/CommonSidebar';
import { ComponentProps, useState } from 'react';
import { Sidebar } from 'components/Sidebar/Sidebar';
import { mockDayAheadMarketSidebarPlants } from 'utils/test/mockPlants';
import { reactRouterDecorator } from 'utils/test/storyDecorators';
import { SECTIONS } from 'types';

export default {
  component: CommonSidebar,
  title: 'Components/Common Sidebar',
  argTypes: {
    onOpenCloseClick: { action: 'tried to open or close' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof CommonSidebar>> = (args) => (
  <CommonSidebar {...args} />
);

export const Open = Template.bind({});

Open.args = {
  open: true,
};

export const Closed = Template.bind({});

Closed.args = {
  open: false,
};

export const DayAheadMarketSidebar: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <CommonSidebar open={open} onOpenCloseClick={() => setOpen(!open)}>
      <Sidebar
        plants={mockDayAheadMarketSidebarPlants}
        priceScenarios={{
          url: `/portfolio/price_area_NO3/${SECTIONS.PRICE_SCENARIOS}`,
          current: false,
        }}
        total={{
          url: `/portfolio/price_area_NO3/${SECTIONS.TOTAL}`,
          current: false,
        }}
        methodPerformance={{
          url: `/portfolio/price_area_NO3/${SECTIONS.BENCHMARKING}`,
          current: false,
        }}
      />
    </CommonSidebar>
  );
};
DayAheadMarketSidebar.decorators = [reactRouterDecorator()];

export const Interactions = () => {
  const [open, setOpen] = useState(true);
  return (
    <CommonSidebar open={open} onOpenCloseClick={() => setOpen(!open)}>
      Hey!
    </CommonSidebar>
  );
};

Interactions.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);

  // Show/Hide button tests
  const hideButton = canvas.getByLabelText('Show or hide sidebar');
  await userEvent.click(hideButton);
  expect(canvas.queryByText('Hey!')).not.toBeInTheDocument();
  await userEvent.click(hideButton);
  expect(canvas.getByText('Hey!')).toBeInTheDocument();
};
