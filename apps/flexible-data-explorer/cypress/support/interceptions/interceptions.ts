import get from 'lodash/get';

import { requestAlias } from './requestAlias';
import { RequestAlias, RequestIntercept } from './types';

const interceptSearchDataTypes = () => {
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

const interceptTimeseriesList = () => {
  cy.intercept({
    url: '**/timeseries/list',
    method: 'POST',
  }).as(requestAlias.timeseriesList);
};

export const interceptions: Record<RequestAlias, RequestIntercept> = {
  searchDataTypes: interceptSearchDataTypes,
  timeseriesList: interceptTimeseriesList,
};
