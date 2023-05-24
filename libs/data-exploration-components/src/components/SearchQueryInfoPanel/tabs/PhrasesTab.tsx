import * as React from 'react';

import { Chip } from '@cognite/cogs.js';
import { HorizontalDivider } from '../elements';

export const PhrasesTab: React.FC = () => {
  return (
    <div data-testid="Phrases-tab">
      <p>
        Use quotation marks <Chip size="small" label='"..."' type="neutral" />{' '}
        to wrap any query to search for an exact phrase.
      </p>
      <HorizontalDivider />
      <p>
        Searching for{' '}
        <Chip size="small" label='"APA Application"' type="neutral" /> will only
        returns results containing the phrase, “APA Application”
      </p>
    </div>
  );
};
