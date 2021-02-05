import React from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { InfoGrid, InfoCell } from './InfoGrid';

export default {
  title: 'Component/InfoGrid',
  component: InfoGrid,
  subcomponents: { InfoCell },
};

export const Example = () => (
  <>
    <InfoGrid noBorders={boolean('InfoGrid/noBorders', false)}>
      <InfoCell
        title={text('InfoCell/title', 'Latest reading')}
        half={boolean('InfoCell/half', true)}
        noBorders={boolean('InfoCell/noBorders', false)}
        noPadding={boolean('InfoCell/noPadding', false)}
      >
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
