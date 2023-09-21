import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';

import {
  getSearchParams,
  getSearchParamsWithJourney,
} from '@data-exploration-lib/core';

import { useCurrentSearchResourceTypeFromLocation } from '../../hooks/hooks';

export default function JourneyRedirect() {
  const resourceType = useCurrentSearchResourceTypeFromLocation();

  const { id = '' } = useParams<{
    id: string;
  }>();
  const parsedId = parseInt(id, 10);

  return (
    <Navigate
      to={createLink(
        `/explore/search/${resourceType}`,
        getSearchParams(
          getSearchParamsWithJourney({
            id: parsedId,
            type: resourceType,
          })
        )
      )}
      replace
    />
  );
}
