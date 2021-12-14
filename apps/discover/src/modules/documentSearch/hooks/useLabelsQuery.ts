import { useQuery } from 'react-query';

import { reportException } from '@cognite/react-errors';

import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';

import { getLabels } from '../service';
import { Labels } from '../types';

export const useLabelsQuery = () => {
  const { data } = useQuery(DOCUMENTS_QUERY_KEY.LABELS, () =>
    getLabels()
      .then((labels) =>
        labels.items.reduce((results, label: any) => {
          return {
            [label.externalId]: label.name,
            ...results,
          };
        }, {} as Labels)
      )
      .catch(reportException)
  );

  if (!data || 'error' in data) return {};

  return data || {};
};
