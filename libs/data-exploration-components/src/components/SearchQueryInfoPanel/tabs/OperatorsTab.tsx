import * as React from 'react';
import { HorizontalDivider, StyledInfobox } from '../elements';
import { Label } from '@cognite/cogs.js';

export const OperatorsTab: React.FC = () => {
  return (
    <div data-testid="Operators-tab">
      <StyledInfobox>
        <span>
          The default operator between the keywords is "AND". Searching for two
          terms without any operator, like "Production Report" will match
          documents containing BOTH the words "Production" AND "Report" in the
          filename or content inside
        </span>
      </StyledInfobox>
      <p>
        <Label size="small">+</Label> Searches for multiple terms. (Searching
        “And”)
      </p>
      <p>
        <span style={{ display: 'inline-flex', flexDirection: 'row' }}>
          <Label
            size="small"
            style={{ marginBottom: 'auto', marginRight: '6px' }}
          >
            |
          </Label>{' '}
          <span>
            Broaden your results. ANY of your search terms can be present
            (Searching “EITHER”, “OR”)
          </span>
        </span>
      </p>
      <p>
        <Label size="small">-</Label> Excludes documents containing a specific
        word
      </p>

      <HorizontalDivider />

      <p>
        <Label size="small">Production + Report</Label> returns documents
        containing both “Production” <strong>AND</strong> “Report” in the
        filename or content.
      </p>
      <p>
        <Label size="small">Production | Report</Label> returns documents
        containing <strong>EITHER</strong> “Production” <strong>AND/OR</strong>{' '}
        “Report” in the filename or content. (Documents containing both
        production and report will be higher than the ones containing only
        report.)
      </p>
      <p>
        <Label size="small">Production - Report</Label> returns documents
        containing the word “Production” but <strong>NOT</strong> the word
        “Report”. (No space between the <Label size="small">-</Label> and the
        term you wish to exclude.)
      </p>
    </div>
  );
};
