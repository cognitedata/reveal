import * as React from 'react';

import { Copy } from '../Copy';
import { H6, SyntaxOperatorsHeaderTab } from '../elements';

export const OperatorsTab: React.FC = () => {
  return (
    <div data-testid="Operators-tab">
      <SyntaxOperatorsHeaderTab>
        <p>
          When using more than one keyword in your search, use{' '}
          <strong>“Boolean operators”</strong>.
        </p>
      </SyntaxOperatorsHeaderTab>

      <H6>Rules</H6>
      <p>
        <Copy>+</Copy> Searches for multiple terms. (Searching “And”)
      </p>
      <p>
        <Copy>|</Copy> Broaden your results. ANY of your search terms can be
        present (Searching “EITHER”, “OR”)
      </p>
      <p>
        <Copy>-</Copy> Excludes documents containing a specific word
      </p>
      <hr />

      <H6>Examples</H6>
      <p>
        1.{' '}
        <Copy text="Stuck + Pipe">
          <strong>Stuck + Pipe</strong>
        </Copy>{' '}
        returns documents containing both “Stuck” <strong>AND</strong> “Pipe” in
        the filename or content.
      </p>
      <p>
        2.{' '}
        <Copy text="Stuck | Pipe">
          <strong>Stuck | Pipe</strong>
        </Copy>{' '}
        returns documents containing <strong>EITHER</strong> “Stuck”{' '}
        <strong>AND/OR</strong> “Pipe” in the filename or content. (Documents
        containing both stuck and pipe will be higher than the ones containing
        only pipe.)
      </p>
      <p>
        3.{' '}
        <Copy text="Stuck - Pipe">
          <strong>Stuck -Pipe</strong>
        </Copy>{' '}
        returns documents containing the word “Stuck” but <strong>NOT</strong>{' '}
        the word “Pipe”. (No space between the <Copy>-</Copy> and the term you
        wish to exclude.)
      </p>
    </div>
  );
};
