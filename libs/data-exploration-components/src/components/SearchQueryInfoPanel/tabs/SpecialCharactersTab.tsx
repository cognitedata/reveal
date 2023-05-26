import * as React from 'react';

import { Chip } from '@cognite/cogs.js';

import { HorizontalDivider } from '../elements';

export const SpecialCharactersTab: React.FC = () => {
  return (
    <div data-testid="Special characters-tab">
      <p>
        When searching special characters such as:{' '}
        <Chip size="small" label="+" type="neutral" />{' '}
        <Chip size="small" type="neutral" label="-" />
        <Chip size="small" label='"' type="neutral" />, type{' '}
        <Chip size="small" label="\" type="neutral" />
        before the special character.
      </p>
      <HorizontalDivider />
      <p>
        To search a phrase that contains{' '}
        <Chip size="small" label=":" type="neutral" />
        such as ”Conclusion:” type{' '}
        <Chip size="small" label="Conclusion\:" type="neutral" />
        into the search bar.
      </p>
    </div>
  );
};
