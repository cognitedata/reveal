import { Meta, Story } from '@storybook/react';
import { MenuBar } from 'components/MenuBar/MenuBar';
import { userEvent, within } from '@storybook/testing-library';
import {
  authDecorator,
  boxDecorator,
  reactQueryDecorator,
  reactRouterDecorator,
} from 'utils/test/storyDecorators';
import { SECTIONS } from 'types';

export default {
  component: MenuBar,
  title: 'Components/Menu Bar',
  decorators: [
    reactQueryDecorator,
    reactRouterDecorator({
      initialEntries: [
        `/${SECTIONS.DAY_AHEAD_MARKET}/price_area_NO2/${SECTIONS.TOTAL}`,
      ],
    }),
    boxDecorator({ width: 1366, height: 500 }),
  ],
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: [1366] },
  },
} as Meta;

export const Cogniter: Story = () => <MenuBar />;
Cogniter.decorators = [authDecorator()];

export const Customer: Story = () => <MenuBar />;
Customer.decorators = [authDecorator(undefined, 'user@lyse.no')];

export const DropdownSuccess: Story = () => <MenuBar />;
DropdownSuccess.decorators = [authDecorator()];
DropdownSuccess.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const dayAheadButton = canvas.getByText('Day Ahead Market');
  userEvent.click(dayAheadButton);
};

export const DropdownLoading: Story = () => <MenuBar />;
DropdownLoading.decorators = [authDecorator('test-loading')];
DropdownLoading.play = DropdownSuccess.play;

export const DropdownError: Story = () => <MenuBar />;
DropdownError.decorators = [authDecorator('test-error')];
DropdownError.play = DropdownSuccess.play;
