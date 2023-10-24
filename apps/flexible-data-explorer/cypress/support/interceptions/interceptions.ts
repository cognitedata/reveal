import get from 'lodash/get';

import { requestAlias } from './requestAlias';

export const interceptSearchDataTypes = () => {
  cy.intercept(
    {
      url: '**/graphql',
      method: 'POST',
    },
    (request) => {
      const query: string = get(request.body, 'query', '');

      if (query.startsWith('query searchDataTypes')) {
        request.alias = requestAlias.searchDataTypes;
      }
    }
  );
};
