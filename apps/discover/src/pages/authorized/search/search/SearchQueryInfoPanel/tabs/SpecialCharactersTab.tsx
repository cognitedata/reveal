import * as React from 'react';

import { Copy } from '../Copy';
import { H6 } from '../elements';

export const SpecialCharactersTab: React.FC = () => {
  return (
    <div data-testid="Special characters-tab">
      <H6>Rules</H6>
      <p>
        When searching special characters such as:{' '}
        <Copy text="+">
          <strong>+</strong>
        </Copy>{' '}
        <Copy text="-">
          <strong>-</strong>
        </Copy>{' '}
        <Copy>&quot;</Copy>, type{' '}
        <Copy text="\">
          <strong>\</strong>
        </Copy>{' '}
        before the special character.
      </p>
      <hr />
      <H6>Example</H6>
      <p>
        To search a phrase that contains <Copy>:</Copy> such as ”Conclusion:”
        type <Copy>Conclusion\:</Copy> into the search bar.
      </p>
    </div>
  );
};
