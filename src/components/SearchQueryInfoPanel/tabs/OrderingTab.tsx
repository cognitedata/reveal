import * as React from 'react';

import { H6 } from '../elements';

export const OrderingTab: React.FC = () => {
  return (
    <div data-testid="Ordering-tab">
      <H6>Ordering by relevance</H6>
      <p>
        Searching returns the “most relevant” documents first, and filters the
        “less relevant” documents last.
      </p>
      <H6>Factors that determine the relevance of a document:</H6>
      <ul>
        <li>
          If the search terms are found multiple times within a document, the
          relevance of that document is higher.
        </li>
        <li>
          For a search with multiple terms, documents that contain all of the
          terms are considered more relevant than documents that only contain
          some of the terms.
        </li>
        <li>
          Matches in the filename field of a document, count for more than
          matches in the content of a document.
        </li>
      </ul>
    </div>
  );
};
