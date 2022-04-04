import { useQuery } from 'react-query';

import { handleServiceError } from 'utils/errors';

import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';

import { getLabels } from '../service';
import { Labels } from '../types';

export const useLabelsQuery = () => {
  const { data } = useQuery<Labels>(DOCUMENTS_QUERY_KEY.LABELS, () =>
    getLabels()
      .then((labels) =>
        labels.items.reduce((results, label: any) => {
          return {
            [label.externalId]: label.name,
            ...results,
          };
        }, {} as Labels)
      )
      .catch((error) => handleServiceError<Labels>(error))
  );

  if (!data || 'error' in data) return {};

  return data || {};
};
