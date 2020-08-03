import React from 'react';
import { InfoGrid, InfoCell } from './InfoGrid';

export default { title: 'Molecules|InfoGrid' };

export const Example = () => (
  <>
    <InfoGrid>
      <InfoCell title="Latest reading">Data</InfoCell>
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
