import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { BidMatrix } from 'components/BidMatrix/BidMatrix';
import dayjs from 'dayjs';
import {
  mockBidMatrixTableData,
  mockMainScenarioTableData,
} from 'components/BidMatrix/BidMatrix.mock';
import { Main } from 'components/BidMatrix/elements';

export default {
  component: BidMatrix,
  title: 'Components/Bid Matrix',
  argTypes: { onBidMatrixCopyClick: { action: 'Copied' } },
} as Meta;

const Template: Story<ComponentProps<typeof BidMatrix>> = (args) => (
  <Main>
    <BidMatrix {...args} />
  </Main>
);

export const Default = Template.bind({});

Default.args = {
  bidDate: dayjs('2022-11-16T12:41:12.062Z'),
  bidMatrixTitle: 'Total',
  bidMatrixExternalId: 'total_bidmatrix_externalid',
  bidMatrixTableData: mockBidMatrixTableData,
  mainScenarioTableData: mockMainScenarioTableData,
};
