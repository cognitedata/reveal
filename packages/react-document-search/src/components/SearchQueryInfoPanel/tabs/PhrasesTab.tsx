import * as React from 'react';
import { Label } from '@cognite/cogs.js';

import { HorizontalDivider } from '../elements';

export const PhrasesTab: React.FC = () => {
  return (
    <div data-testid="Phrases-tab">
      <p>
        Use quotation marks <Label size="small">&quot;...&quot;</Label> to wrap
        any query to search for an exact phrase.
      </p>
      <HorizontalDivider />
      <p>
        Searching for{' '}
        <Label size="small">
          &quot;<strong>APA Application</strong>&quot;
        </Label>{' '}
        will only returns results containing the phrase, “APA Application”
      </p>
    </div>
  );
};
