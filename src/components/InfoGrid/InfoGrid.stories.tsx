import React from 'react';
import { InfoGrid, InfoCell } from './InfoGrid';

export default {
  title: 'Component/InfoGrid',
  component: InfoGrid,
  subcomponents: { InfoCell },
  argTypes: { noBorders: { control: 'boolean' } },
};

export const Example = args => (
  <>
    <InfoGrid {...args}>
      <InfoCell title="Latest reading" half noBorders={false} noPadding={false}>
        Data
      </InfoCell>
      <InfoCell title="Type" half>
        Small data
      </InfoCell>
      <InfoCell title="System" half>
        Small data
      </InfoCell>
      <InfoCell title="Other details">More more data</InfoCell>
    </InfoGrid>
    <br />
    <InfoGrid>
      <InfoCell title="System" half>
        Small data
      </InfoCell>
      <InfoCell title="Type" half>
        Small data
      </InfoCell>
      <InfoCell title="Latest reading">Data</InfoCell>

      <InfoCell title="Type" half>
        Small data
      </InfoCell>
      <InfoCell title="Type" half>
        Small data
      </InfoCell>
      <InfoCell>More more data</InfoCell>
    </InfoGrid>
  </>
);
