import { expect } from '@storybook/jest';
import { Meta, Story } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { ShopQualityAssuranceModal } from 'components/ShopQualityAssuranceModal/ShopQualityAssuranceModal';
import { ComponentProps } from 'react';
import { PAGES, SECTIONS } from 'types';
import {
  authDecorator,
  boxDecorator,
  reactQueryDecorator,
  reactRouterDecorator,
} from 'utils/test/storyDecorators';

export default {
  component: ShopQualityAssuranceModal,
  title: 'Components/SHOP Quality Assurance Modal',
  decorators: [
    reactRouterDecorator(
      {
        initialEntries: [
          `/power-ops-staging/${SECTIONS.DAY_AHEAD_MARKET}/price_area_NO2/${SECTIONS.TOTAL}`,
        ],
      },
      `/:project${PAGES.PRICE_AREA}/:plantExternalId`
    ),
    authDecorator(),
    reactQueryDecorator,
    boxDecorator({ width: 1366, height: 638 }),
  ],
  args: {
    bidProcessEventExternalId: 'total_bidmatrix_externalid',
  },
  parameters: {
    chromatic: { viewports: [1366] },
  },
} as Meta;

const Template: Story<ComponentProps<typeof ShopQualityAssuranceModal>> = (
  args
) => <ShopQualityAssuranceModal {...args} />;

export const Default = Template.bind({});

export const OpenDialog = Template.bind({});

OpenDialog.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const viewReportButton = await canvas.findByText('View Report');
  userEvent.click(viewReportButton);

  const modalTitle = await canvas.findByText('Shop run penalties');
  expect(modalTitle).toBeInTheDocument();
};

export const Interactions = Template.bind({});

Interactions.play = async ({ canvasElement, ...args }) => {
  const canvas = within(canvasElement);
  await OpenDialog.play!({ canvasElement, ...args });
  const closeButton = await canvas.findByTestId('close-modal-icon');
  userEvent.click(closeButton);
};
