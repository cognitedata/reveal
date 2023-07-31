import * as React from 'react';

import { Copy } from '../Copy';
import { H6, HintColor } from '../elements';

export const PhrasesTab: React.FC = () => {
  return (
    <div data-testid="Phrases-tab">
      <H6>Rules</H6>
      <p>
        Use quotation marks{' '}
        <Copy text='"..."'>
          &quot;<HintColor>...</HintColor>&quot;
        </Copy>{' '}
        to wrap any query to search for an exact phrase.
      </p>
      <hr />
      <H6>Example</H6>
      <p>
        Searching for{' '}
        <Copy text='"APA Application"'>
          &quot;<strong>APA Application</strong>&quot;
        </Copy>{' '}
        will only returns results containing the phrase, “APA Application”
      </p>
    </div>
  );
};
