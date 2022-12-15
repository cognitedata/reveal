import * as React from 'react';

import { HorizontalDivider } from '../elements';
import { Label } from '@cognite/cogs.js';

export const SpecialCharactersTab: React.FC = () => {
  return (
    <div data-testid="Special characters-tab">
      <p>
        When searching special characters such as:{' '}
        <Label size="small">
          <strong>+</strong>
        </Label>{' '}
        <Label size="small">
          <strong>-</strong>
        </Label>{' '}
        <Label size="small">&quot;</Label>, type{' '}
        <Label size="small">
          <strong>\</strong>
        </Label>{' '}
        before the special character.
      </p>
      <HorizontalDivider />
      <p>
        To search a phrase that contains <Label size="small">:</Label> such as
        ”Conclusion:” type <Label size="small">Conclusion\:</Label> into the
        search bar.
      </p>
    </div>
  );
};
